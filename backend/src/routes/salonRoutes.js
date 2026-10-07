const express = require("express");
const {
	listarSalones,
	listarMisSalones,
	obtenerSalonPorId,
	crearSalon,
	actualizarSalon,
	eliminarSalon,
} = require("../controllers/salonController");
const { verificarToken, autorizarRol } = require("../middlewares/autenticacion");

const router = express.Router();

// Rutas públicas: cualquiera puede ver los salones publicados.
// GET /api/salones
router.get("/", listarSalones);

// Rutas protegidas: solo un anfitrión autenticado puede administrar
// sus propios salones. IMPORTANTE: "/mis-salones" debe declararse
// antes de "/:id" para que Express no la confunda con un id.
router.get("/mis-salones", verificarToken, autorizarRol("anfitrion"), listarMisSalones);
router.get("/:id", obtenerSalonPorId);

router.post("/", verificarToken, autorizarRol("anfitrion"), crearSalon);
router.put("/:id", verificarToken, autorizarRol("anfitrion"), actualizarSalon);
router.delete("/:id", verificarToken, autorizarRol("anfitrion"), eliminarSalon);

module.exports = router;
