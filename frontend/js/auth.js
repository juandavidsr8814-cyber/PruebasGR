/**
 * auth.js
 * ---------------------------------------------------------------
 * Lógica de autenticación y de comunicación con el API.
 *
 * CAMBIOS respecto a la versión anterior:
 * 1. Ahora se guarda también el token JWT que devuelve el login,
 *    y se adjunta automáticamente en cada petición protegida
 *    (encabezado "Authorization: Bearer <token>"). Antes no existía
 *    ningún token: cada función mandaba el correo del usuario como
 *    si fuera su identidad, sin ninguna verificación real.
 * 2. Se agregan las funciones de reservas (crearReserva,
 *    listarReservasAnfitrion, listarReservasCliente,
 *    actualizarEstadoReserva, agregarMensajeReserva) y
 *    obtenerSalonPorId, que el backend ya soportaba pero que no
 *    existían aquí — por eso las páginas que las usaban fallaban.
 * ---------------------------------------------------------------
 */

const CLAVE_SESION = "reservas_salones_sesion";
const URL_BACKEND = "http://localhost:4000/api";
const CLAVE_MENSAJE_SESION = "reservas_salones_mensaje_sesion";

/**
 * Lee (y borra) un mensaje dejado para mostrar en la próxima pantalla de
 * login — por ejemplo, tras cerrar la sesión automáticamente. Se usa una
 * sola vez para no repetir el mensaje si el usuario recarga la página.
 */
function leerMensajeSesion() {
  const mensaje = sessionStorage.getItem(CLAVE_MENSAJE_SESION);
  sessionStorage.removeItem(CLAVE_MENSAJE_SESION);
  return mensaje;
}

function guardarSesion(usuario, token) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify({ usuario, token }));
}

function obtenerSesionCompleta() {
  const datos = localStorage.getItem(CLAVE_SESION);
  return datos ? JSON.parse(datos) : null;
}

function obtenerUsuarioActual() {
  const sesion = obtenerSesionCompleta();
  return sesion ? sesion.usuario : null;
}

function obtenerToken() {
  const sesion = obtenerSesionCompleta();
  return sesion ? sesion.token : null;
}

function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}

/**
 * Llama a un endpoint público de autenticación (no requiere token,
 * porque todavía no existe sesión: registro, login, recuperar).
 */
async function solicitarApi(ruta, datos) {
  try {
    const respuesta = await fetch(`${URL_BACKEND}/auth/${ruta}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      return { ok: false, mensaje: resultado.mensaje || "No fue posible completar la solicitud." };
    }

    return resultado;
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return {
      ok: false,
      mensaje: "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
    };
  }
}

/**
 * Llama a cualquier otro endpoint del backend, adjuntando el token
 * de la sesión activa (si existe) en el encabezado Authorization.
 *
 * MEJORA: toda respuesta de error trae ahora un campo "tipo" para que
 * la pantalla pueda reaccionar distinto según el problema:
 *  - "sesion": el token venció o ya no es válido → se cierra sesión sola.
 *  - "red": no hubo respuesta del servidor (apagado, sin internet, CORS).
 *  - sin "tipo": error de negocio normal (permisos, datos inválidos, etc.),
 *    ya viene con un mensaje claro para mostrar tal cual.
 */
const MENSAJE_SESION_VENCIDA = "Tu sesión expiró o no es válida. Inicia sesión de nuevo.";

async function solicitarBackend(ruta, opciones = {}) {
  let respuesta;
  try {
    const token = obtenerToken();
    const encabezados = { ...(opciones.headers || {}) };
    if (token) {
      encabezados.Authorization = `Bearer ${token}`;
    }
    respuesta = await fetch(`${URL_BACKEND}${ruta}`, { ...opciones, headers: encabezados });
  } catch (error) {
    console.error("Error al conectar con el backend:", error);
    return {
      ok: false,
      tipo: "red",
      mensaje: "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
    };
  }

  // Si el usuario tenía sesión y el servidor la rechaza (401), es que el
  // token venció o ya no es válido (por ejemplo, si cambió la clave del
  // servidor). Se cierra la sesión localmente para no dejar al usuario
  // "atascado" viendo errores sin saber por qué.
  if (respuesta.status === 401 && obtenerToken()) {
    cerrarSesion();
    if (!window.location.pathname.endsWith("login.html")) {
      sessionStorage.setItem(CLAVE_MENSAJE_SESION, MENSAJE_SESION_VENCIDA);
      window.location.replace("login.html");
    }
    return { ok: false, tipo: "sesion", mensaje: MENSAJE_SESION_VENCIDA };
  }

  const resultado = await respuesta.json();
  if (!respuesta.ok) {
    return { ok: false, mensaje: resultado.mensaje || "No fue posible completar la solicitud." };
  }
  return resultado;
}

// ---------- Autenticación ----------

/**
 * Registra un nuevo usuario si el correo no existe todavía.
 * @param {{nombre: string, correo: string, contrasena: string, rol: string}} datos
 */
function registrarUsuario(datos) {
  return solicitarApi("registro", datos);
}

/**
 * Valida credenciales de inicio de sesión y guarda el token recibido.
 * @param {string} correo
 * @param {string} contrasena
 */
async function iniciarSesion(correo, contrasena) {
  const resultado = await solicitarApi("login", { correo, contrasena });

  if (resultado.ok && resultado.usuario && resultado.token) {
    guardarSesion(resultado.usuario, resultado.token);
  }

  return resultado;
}

/**
 * Simula el envío de un enlace de recuperación de contraseña.
 * @param {string} correo
 */
function solicitarRecuperacion(correo) {
  return solicitarApi("recuperar", { correo });
}

// ---------- Salones ----------
// Ya no se envía el correo del anfitrión: el backend lo obtiene del
// token de la sesión activa.

function crearSalon(datos) {
  return solicitarBackend("/salones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

function obtenerSalones() {
  return solicitarBackend("/salones");
}

function obtenerSalonPorId(id) {
  return solicitarBackend(`/salones/${encodeURIComponent(id)}`);
}

function obtenerMisSalones() {
  return solicitarBackend("/salones/mis-salones");
}

function actualizarSalon(id, datos) {
  return solicitarBackend(`/salones/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

function eliminarSalon(id) {
  return solicitarBackend(`/salones/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------- Reservas ----------
// Antes no existían estas funciones: las páginas que las llamaban
// (detalle-salon.html, panel-cliente) fallaban en tiempo de ejecución.

function crearReserva(datos) {
  return solicitarBackend("/reservas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
}

function listarReservasAnfitrion() {
  return solicitarBackend("/reservas/anfitrion");
}

function listarReservasCliente() {
  return solicitarBackend("/reservas/cliente");
}

function actualizarEstadoReserva(id, estado) {
  return solicitarBackend(`/reservas/${encodeURIComponent(id)}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });
}

function agregarMensajeReserva(id, mensaje) {
  return solicitarBackend(`/reservas/${encodeURIComponent(id)}/mensajes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje }),
  });
}

/**
 * Escapa caracteres especiales de HTML. Se usa antes de insertar texto
 * escrito por usuarios (nombres, mensajes, descripciones) dentro de
 * innerHTML, para evitar que alguien inyecte código en la página (XSS).
 */
function escaparHtml(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

window.Auth = {
  escaparHtml,
  registrarUsuario,
  iniciarSesion,
  solicitarRecuperacion,
  obtenerUsuarioActual,
  cerrarSesion,
  leerMensajeSesion,
  crearSalon,
  obtenerSalones,
  obtenerSalonPorId,
  obtenerMisSalones,
  actualizarSalon,
  eliminarSalon,
  crearReserva,
  listarReservasAnfitrion,
  listarReservasCliente,
  actualizarEstadoReserva,
  agregarMensajeReserva,
};
