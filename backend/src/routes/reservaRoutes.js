const express = require("express");
const { crearReserva, listarReservasAnfitrion, listarReservasCliente, actualizarEstadoReserva, agregarMensajeReserva } = require("../controllers/reservaController");
const { verificarToken, autorizarRol } = require("../middlewares/autenticacion");

const router = express.Router();

// Todas las rutas de reservas requieren estar autenticado.
router.post("/", verificarToken, autorizarRol("cliente"), crearReserva);
router.get("/anfitrion", verificarToken, autorizarRol("anfitrion"), listarReservasAnfitrion);
router.get("/cliente", verificarToken, autorizarRol("cliente"), listarReservasCliente);
router.patch("/:id/estado", verificarToken, autorizarRol("anfitrion"), actualizarEstadoReserva);
router.post("/:id/mensajes", verificarToken, agregarMensajeReserva);

module.exports = router;
