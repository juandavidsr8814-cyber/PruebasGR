/**
 * autenticacion.js
 * ---------------------------------------------------------------
 * Middleware para verificar el token JWT enviado por el cliente en
 * el encabezado Authorization ("Authorization: Bearer <token>"), y
 * para restringir el acceso a una ruta según el rol del usuario
 * autenticado.
 *
 * Antes de este middleware, las rutas protegidas confiaban en un
 * campo "correo" enviado en el body o la query string para saber
 * quién hacía la petición. Eso permitía que cualquiera se hiciera
 * pasar por otro usuario con solo conocer su correo. Ahora la
 * identidad viene firmada dentro del token, generado por el
 * servidor en el login, y no puede ser falsificada por el cliente.
 * ---------------------------------------------------------------
 */

const jwt = require("jsonwebtoken");

/**
 * Verifica que la petición traiga un token válido y agrega los
 * datos del usuario autenticado en req.usuario.
 */
function verificarToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({
      ok: false,
      mensaje: "Debes iniciar sesión para realizar esta acción.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.id, correo: payload.correo, rol: payload.rol };
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: "Tu sesión no es válida o ya expiró. Inicia sesión de nuevo.",
    });
  }
}

/**
 * Middleware de fábrica: solo deja continuar si el usuario
 * autenticado tiene uno de los roles permitidos. Debe usarse
 * después de verificarToken.
 * Uso: router.post("/", verificarToken, autorizarRol("anfitrion"), crearSalon)
 */
function autorizarRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: "No tienes permisos para realizar esta acción.",
      });
    }
    next();
  };
}

module.exports = { verificarToken, autorizarRol };
