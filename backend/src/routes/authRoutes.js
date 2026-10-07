/**
 * authRoutes.js
 * ---------------------------------------------------------------
 * Rutas del módulo de autenticación, montadas bajo /api/auth
 * (ver src/app.js).
 * ---------------------------------------------------------------
 */

const express = require("express");
const { registrar, iniciarSesion, solicitarRecuperacion } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/registro
router.post("/registro", registrar);

// POST /api/auth/login
router.post("/login", iniciarSesion);

// POST /api/auth/recuperar
router.post("/recuperar", solicitarRecuperacion);

module.exports = router;
