/**
 * reservaController.js
 * ---------------------------------------------------------------
 * CAMBIO (ajuste de seguridad): antes, cada acción (crear reserva,
 * listar solicitudes, aceptar/rechazar, enviar mensaje) recibía un
 * correo en el body/query y buscaba ese usuario sin verificar nada
 * más. Ahora la identidad del usuario que hace la petición viene
 * de req.usuario (puesta por el middleware verificarToken), así
 * que ya no se puede actuar en nombre de otra cuenta.
 * ---------------------------------------------------------------
 */

const mongoose = require("mongoose");
const Reserva = require("../models/Reserva");
const Salon = require("../models/Salon");

function serializarReserva(reserva) {
	return {
		id: reserva._id,
		salon: reserva.salon?._id || reserva.salon,
		nombreSalon: reserva.salon?.nombre,
		ubicacionSalon: reserva.salon?.ubicacion,
		cliente: reserva.cliente?._id || reserva.cliente,
		nombreCliente: reserva.cliente?.nombre,
		correoCliente: reserva.cliente?.correo,
		anfitrion: reserva.anfitrion?._id || reserva.anfitrion,
		fecha: reserva.fecha,
		invitados: reserva.invitados,
		mensaje: reserva.mensaje,
		estado: reserva.estado,
		creadaEn: reserva.createdAt,
		mensajes: (reserva.mensajes || []).map((mensaje) => ({
			id: mensaje._id,
			autor: mensaje.autor?._id || mensaje.autor,
			nombreAutor: mensaje.autor?.nombre,
			texto: mensaje.texto,
			creadoEn: mensaje.creadoEn,
		})),
	};
}

// POST /api/reservas (protegida, rol cliente)
async function crearReserva(req, res) {
	try {
		const { salonId, fecha, invitados, mensaje } = req.body;
		if (!salonId || !fecha || !invitados) {
			return res.status(400).json({ ok: false, mensaje: "Completa la fecha y los invitados para solicitar la reserva." });
		}
		if (!mongoose.isValidObjectId(salonId)) {
			return res.status(400).json({ ok: false, mensaje: "El salón indicado no es válido." });
		}

		const salon = await Salon.findOne({ _id: salonId, estado: "publicado" });
		if (!salon) return res.status(404).json({ ok: false, mensaje: "El salón no está disponible." });

		const fechaReserva = new Date(fecha);
		if (Number.isNaN(fechaReserva.getTime()) || fechaReserva < new Date()) {
			return res.status(400).json({ ok: false, mensaje: "Selecciona una fecha futura válida." });
		}
		if (Number(invitados) > salon.capacidad) {
			return res.status(400).json({ ok: false, mensaje: `Este salón tiene capacidad para ${salon.capacidad} personas.` });
		}

		const reserva = await Reserva.create({
			salon: salon._id,
			cliente: req.usuario.id,
			anfitrion: salon.anfitrion,
			fecha: fechaReserva,
			invitados: Number(invitados),
			mensaje: mensaje || "",
		});
		return res.status(201).json({ ok: true, mensaje: "Solicitud enviada al anfitrión.", reserva: serializarReserva(reserva) });
	} catch (error) {
		console.error("Error en crearReserva:", error.message);
		return res.status(400).json({ ok: false, mensaje: "No fue posible crear la solicitud." });
	}
}

// GET /api/reservas/anfitrion (protegida, rol anfitrion)
async function listarReservasAnfitrion(req, res) {
	try {
		const reservas = await Reserva.find({ anfitrion: req.usuario.id })
			.populate("salon", "nombre ubicacion")
			.populate("cliente", "nombre correo")
			.populate("mensajes.autor", "nombre")
			.sort({ createdAt: -1 });
		return res.json({ ok: true, reservas: reservas.map(serializarReserva) });
	} catch (error) {
		console.error("Error en listarReservasAnfitrion:", error.message);
		return res.status(500).json({ ok: false, mensaje: "No fue posible cargar las solicitudes." });
	}
}

// GET /api/reservas/cliente (protegida, rol cliente)
async function listarReservasCliente(req, res) {
	try {
		const reservas = await Reserva.find({ cliente: req.usuario.id })
			.populate("salon", "nombre ubicacion")
			.populate("mensajes.autor", "nombre")
			.sort({ fecha: -1 });
		return res.json({ ok: true, reservas: reservas.map(serializarReserva) });
	} catch (error) {
		console.error("Error en listarReservasCliente:", error.message);
		return res.status(500).json({ ok: false, mensaje: "No fue posible cargar tus reservas." });
	}
}

// PATCH /api/reservas/:id/estado (protegida, rol anfitrion, dueño de la reserva)
async function actualizarEstadoReserva(req, res) {
	try {
		const { estado } = req.body;
		if (!["aceptada", "rechazada"].includes(estado)) {
			return res.status(400).json({ ok: false, mensaje: "El estado de la solicitud no es válido." });
		}
		const reserva = await Reserva.findOneAndUpdate(
			{ _id: req.params.id, anfitrion: req.usuario.id, estado: "pendiente" },
			{ estado },
			{ new: true }
		).populate("salon", "nombre").populate("cliente", "nombre correo");
		if (!reserva) return res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada o ya procesada." });
		return res.json({ ok: true, mensaje: estado === "aceptada" ? "Solicitud aceptada." : "Solicitud rechazada.", reserva: serializarReserva(reserva) });
	} catch (error) {
		console.error("Error en actualizarEstadoReserva:", error.message);
		return res.status(400).json({ ok: false, mensaje: "No fue posible actualizar la solicitud." });
	}
}

// POST /api/reservas/:id/mensajes (protegida, cliente o anfitrion de la reserva)
async function agregarMensajeReserva(req, res) {
	try {
		const { mensaje } = req.body;
		if (!mensaje || !mensaje.trim()) return res.status(400).json({ ok: false, mensaje: "Escribe un mensaje antes de enviarlo." });

		const reserva = await Reserva.findById(req.params.id).select("cliente anfitrion");
		if (!reserva || ![String(reserva.cliente), String(reserva.anfitrion)].includes(String(req.usuario.id))) {
			return res.status(404).json({ ok: false, mensaje: "Solicitud no encontrada." });
		}
		await Reserva.updateOne(
			{ _id: reserva._id },
			{ $push: { mensajes: { autor: req.usuario.id, texto: mensaje.trim() } } }
		);
		const reservaActualizada = await Reserva.findById(reserva._id)
			.populate("salon", "nombre ubicacion")
			.populate("cliente", "nombre correo")
			.populate("mensajes.autor", "nombre");
		return res.status(201).json({ ok: true, mensaje: "Mensaje enviado.", reserva: serializarReserva(reservaActualizada) });
	} catch (error) {
		console.error("Error en agregarMensajeReserva:", error.message);
		return res.status(400).json({ ok: false, mensaje: "No fue posible enviar el mensaje." });
	}
}

module.exports = { crearReserva, listarReservasAnfitrion, listarReservasCliente, actualizarEstadoReserva, agregarMensajeReserva };
