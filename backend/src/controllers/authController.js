/**
 * authController.js
 * ---------------------------------------------------------------
 * Lógica de negocio para registro e inicio de sesión de usuarios.
 * Las contraseñas se almacenan siempre encriptadas con bcrypt,
 * nunca en texto plano.
 *
 * CAMBIO (ajuste de seguridad): el login ahora genera un token JWT
 * firmado por el servidor. Ese token es lo que el front-end debe
 * enviar en las siguientes peticiones (encabezado Authorization)
 * para demostrar quién es, en vez de simplemente mandar su correo.
 * ---------------------------------------------------------------
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const RONDAS_SAL = 10; // costo del hashing con bcrypt

/**
 * Quita el campo "contrasena" antes de enviar el usuario al cliente.
 * @param {Object} usuarioMongo - documento de Mongoose
 * @returns {Object}
 */
function serializarUsuario(usuarioMongo) {
  return {
    id: usuarioMongo._id,
    nombre: usuarioMongo.nombre,
    correo: usuarioMongo.correo,
    rol: usuarioMongo.rol,
  };
}

/**
 * Genera un token JWT firmado con la identidad del usuario.
 * Este token es lo único que el backend confía para saber quién
 * hace una petición en las rutas protegidas.
 */
function generarToken(usuarioMongo) {
  return jwt.sign(
    { id: usuarioMongo._id, correo: usuarioMongo.correo, rol: usuarioMongo.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA || "2h" }
  );
}

/**
 * POST /api/auth/registro
 * Crea un nuevo usuario si el correo no existe todavía.
 */
async function registrar(req, res) {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre, correo y contraseña son obligatorios.",
      });
    }

    const correoNormalizado = correo.toLowerCase().trim();
    const yaExiste = await Usuario.findOne({ correo: correoNormalizado });

    if (yaExiste) {
      return res.status(409).json({
        ok: false,
        mensaje: "Ya existe una cuenta registrada con este correo.",
      });
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, RONDAS_SAL);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo: correoNormalizado,
      contrasena: contrasenaEncriptada,
      rol: rol === "anfitrion" ? "anfitrion" : "cliente",
    });

    return res.status(201).json({
      ok: true,
      mensaje: "Cuenta creada correctamente. Ahora puedes iniciar sesión.",
      usuario: serializarUsuario(nuevoUsuario),
    });
  } catch (error) {
    console.error("Error en registrar:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Ocurrió un error al crear la cuenta. Intenta de nuevo.",
    });
  }
}

/**
 * POST /api/auth/login
 * Verifica credenciales y devuelve los datos públicos del usuario
 * junto con un token JWT para las siguientes peticiones.
 */
async function iniciarSesion(req, res) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({
        ok: false,
        mensaje: "Correo y contraseña son obligatorios.",
      });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase().trim() });

    if (!usuario) {
      return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos." });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!coincide) {
      return res.status(401).json({ ok: false, mensaje: "Correo o contraseña incorrectos." });
    }

    return res.status(200).json({
      ok: true,
      mensaje: `Bienvenido, ${usuario.nombre}.`,
      usuario: serializarUsuario(usuario),
      token: generarToken(usuario),
    });
  } catch (error) {
    console.error("Error en iniciarSesion:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Ocurrió un error al iniciar sesión. Intenta de nuevo.",
    });
  }
}

/**
 * POST /api/auth/recuperar
 * Simula el envío de un enlace de recuperación (no envía correo real
 * todavía). Por seguridad, siempre responde igual exista o no la
 * cuenta, para no filtrar qué correos están registrados.
 */
async function solicitarRecuperacion(req, res) {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ ok: false, mensaje: "El correo es obligatorio." });
    }

    // No se hace nada distinto si existe o no; solo se deja el punto
    // de extensión para cuando se integre el envío de correos real.
    await Usuario.findOne({ correo: correo.toLowerCase().trim() });

    return res.status(200).json({
      ok: true,
      mensaje: "Si el correo está registrado, recibirás un enlace de recuperación.",
    });
  } catch (error) {
    console.error("Error en solicitarRecuperacion:", error.message);
    return res.status(500).json({
      ok: false,
      mensaje: "Ocurrió un error al procesar la solicitud.",
    });
  }
}

module.exports = { registrar, iniciarSesion, solicitarRecuperacion };
