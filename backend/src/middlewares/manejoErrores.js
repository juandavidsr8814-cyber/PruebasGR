/**
 * manejoErrores.js
 * ---------------------------------------------------------------
 * Middlewares genéricos: ruta no encontrada (404) y manejo de
 * errores no controlados (500).
 * ---------------------------------------------------------------
 */

function rutaNoEncontrada(req, res, next) {
  res.status(404).json({ ok: false, mensaje: `Ruta no encontrada: ${req.originalUrl}` });
}

function manejadorErrores(error, req, res, next) {
  console.error("Error no controlado:", error);
  res.status(500).json({ ok: false, mensaje: "Error interno del servidor." });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
