/**
 * salonController.js
 * ---------------------------------------------------------------
 * CAMBIO (ajuste de seguridad): las rutas de administración de
 * salones (mis-salones, crear, actualizar, eliminar) ya no reciben
 * el correo del anfitrión desde el body/query. Ese dato se leía sin
 * verificar nada, así que cualquiera podía enviar el correo de otro
 * anfitrión y administrar sus salones. Ahora la identidad viene de
 * req.usuario, que pone el middleware verificarToken después de
 * validar el token JWT.
 * ---------------------------------------------------------------
 */

const mongoose = require("mongoose");
const Salon = require("../models/Salon");

function serializarSalon(salon) {
  return {
    id: salon._id,
    nombre: salon.nombre,
    descripcion: salon.descripcion,
    capacidad: salon.capacidad,
    ubicacion: salon.ubicacion,
    precio: salon.precio,
    extras: salon.extras,
    fotos: salon.fotos,
    diasMinimo: salon.diasMinimo,
    tiempoMinimo: salon.tiempoMinimo,
    pagoOnline: salon.pagoOnline,
    pagoPresencial: salon.pagoPresencial,
    anfitrion: salon.anfitrion,
    estado: salon.estado,
  };
}

// GET /api/salones (pública)
async function listarSalones(req, res) {
  try {
    const salones = await Salon.find({ estado: "publicado" }).sort({ createdAt: -1 });
    return res.json({ ok: true, salones: salones.map(serializarSalon) });
  } catch (error) {
    console.error("Error en listarSalones:", error.message);
    return res.status(500).json({ ok: false, mensaje: "No fue posible cargar los salones." });
  }
}

// GET /api/salones/mis-salones (protegida, rol anfitrion)
async function listarMisSalones(req, res) {
  try {
    const salones = await Salon.find({ anfitrion: req.usuario.id }).sort({ createdAt: -1 });
    return res.json({ ok: true, salones: salones.map(serializarSalon) });
  } catch (error) {
    console.error("Error en listarMisSalones:", error.message);
    return res.status(500).json({ ok: false, mensaje: "No fue posible cargar tus salones." });
  }
}

// GET /api/salones/:id (pública)
async function obtenerSalonPorId(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ ok: false, mensaje: "ID de salón inválido." });
    }

    const salon = await Salon.findOne({ _id: id, estado: "publicado" });
    if (!salon) {
      return res.status(404).json({ ok: false, mensaje: "Salón no encontrado." });
    }

    return res.json({ ok: true, salon: serializarSalon(salon) });
  } catch (error) {
    console.error("Error en obtenerSalonPorId:", error.message);
    return res.status(500).json({ ok: false, mensaje: "No fue posible cargar el salón." });
  }
}

// POST /api/salones (protegida, rol anfitrion)
async function crearSalon(req, res) {
  try {
    const {
      nombre,
      descripcion,
      capacidad,
      ubicacion,
      precio,
      extras,
      fotos,
      diasMinimo,
      tiempoMinimo,
      pagoOnline,
      pagoPresencial,
    } = req.body;

    if (!nombre || !descripcion || !capacidad || !ubicacion || precio === undefined) {
      return res.status(400).json({
        ok: false,
        mensaje: "Completa todos los datos obligatorios del salón.",
      });
    }

    const salon = await Salon.create({
      anfitrion: req.usuario.id,
      nombre,
      descripcion,
      capacidad,
      ubicacion,
      precio,
      extras: Array.isArray(extras) ? extras : [],
      fotos: Array.isArray(fotos) ? fotos : [],
      diasMinimo,
      tiempoMinimo,
      pagoOnline,
      pagoPresencial,
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Salón publicado correctamente.",
      salon: serializarSalon(salon),
    });
  } catch (error) {
    console.error("Error en crearSalon:", error.message);
    return res.status(400).json({
      ok: false,
      mensaje: "Los datos del salón no son válidos.",
    });
  }
}

// PUT /api/salones/:id (protegida, rol anfitrion, dueño del salón)
async function actualizarSalon(req, res) {
  try {
    const cambios = {
      nombre: req.body.nombre,
      descripcion: req.body.descripcion,
      capacidad: req.body.capacidad,
      ubicacion: req.body.ubicacion,
      precio: req.body.precio,
      extras: Array.isArray(req.body.extras) ? req.body.extras : [],
      diasMinimo: req.body.diasMinimo,
      tiempoMinimo: req.body.tiempoMinimo,
      pagoOnline: req.body.pagoOnline,
      pagoPresencial: req.body.pagoPresencial,
    };

    // Las fotos solo se reemplazan si el cliente envía un nuevo arreglo;
    // si no llega el campo, se conservan las fotos que ya tenía el salón.
    if (Array.isArray(req.body.fotos)) {
      cambios.fotos = req.body.fotos;
    }

    const salon = await Salon.findOneAndUpdate(
      { _id: req.params.id, anfitrion: req.usuario.id },
      { $set: cambios },
      { new: true, runValidators: true }
    );

    if (!salon) return res.status(404).json({ ok: false, mensaje: "Salón no encontrado." });
    return res.json({ ok: true, mensaje: "Salón actualizado correctamente.", salon: serializarSalon(salon) });
  } catch (error) {
    console.error("Error en actualizarSalon:", error.message);
    return res.status(400).json({ ok: false, mensaje: "Los datos del salón no son válidos." });
  }
}

// DELETE /api/salones/:id (protegida, rol anfitrion, dueño del salón)
async function eliminarSalon(req, res) {
  try {
    const salon = await Salon.findOneAndDelete({ _id: req.params.id, anfitrion: req.usuario.id });
    if (!salon) return res.status(404).json({ ok: false, mensaje: "Salón no encontrado." });
    return res.json({ ok: true, mensaje: "Salón eliminado correctamente." });
  } catch (error) {
    console.error("Error en eliminarSalon:", error.message);
    return res.status(400).json({ ok: false, mensaje: "No fue posible eliminar el salón." });
  }
}

module.exports = {
  listarSalones,
  listarMisSalones,
  obtenerSalonPorId,
  crearSalon,
  actualizarSalon,
  eliminarSalon,
};
