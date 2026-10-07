/**
 * validaciones.js
 * ---------------------------------------------------------------
 * Módulo de validaciones reutilizable para los formularios de
 * autenticación (login, registro y recuperación de contraseña)
 * de la plataforma de reservas de salones.
 *
 * Evidencia: GA7-220501096-AA4-EV03
 *
 * No depende de ningún framework: se apoya en el DOM estándar.
 * Cada función de validación retorna un objeto { valido, mensaje }
 * para que el formulario que la use decida cómo mostrar el error.
 * ---------------------------------------------------------------
 */

// Expresión regular básica para validar formato de correo electrónico.
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Contraseña segura: mínimo 8 caracteres, al menos una mayúscula,
// una minúscula y un número.
const REGEX_CONTRASENA_SEGURA = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Valida que un campo de texto no esté vacío (quitando espacios).
 * @param {string} valor
 * @returns {{valido: boolean, mensaje: string}}
 */
function validarRequerido(valor) {
  const limpio = (valor || "").trim();
  return {
    valido: limpio.length > 0,
    mensaje: "Este campo es obligatorio.",
  };
}

/**
 * Valida formato de correo electrónico.
 * @param {string} correo
 * @returns {{valido: boolean, mensaje: string}}
 */
function validarCorreo(correo) {
  const limpio = (correo || "").trim();
  if (limpio.length === 0) {
    return { valido: false, mensaje: "El correo es obligatorio." };
  }
  return {
    valido: REGEX_CORREO.test(limpio),
    mensaje: "Ingresa un correo electrónico válido (ej: nombre@dominio.com).",
  };
}

/**
 * Valida que la contraseña cumpla con criterios mínimos de seguridad.
 * @param {string} contrasena
 * @returns {{valido: boolean, mensaje: string}}
 */
function validarContrasenaSegura(contrasena) {
  const valor = contrasena || "";
  return {
    valido: REGEX_CONTRASENA_SEGURA.test(valor),
    mensaje:
      "La contraseña debe tener mínimo 8 caracteres, incluir una mayúscula, una minúscula y un número.",
  };
}

/**
 * Valida que dos campos de contraseña coincidan (registro).
 * @param {string} contrasena
 * @param {string} confirmacion
 * @returns {{valido: boolean, mensaje: string}}
 */
function validarCoincidenciaContrasena(contrasena, confirmacion) {
  return {
    valido: contrasena === confirmacion && confirmacion.length > 0,
    mensaje: "Las contraseñas no coinciden.",
  };
}

/**
 * Valida que un checkbox obligatorio (ej: aceptar términos) esté marcado.
 * @param {boolean} marcado
 * @returns {{valido: boolean, mensaje: string}}
 */
function validarAceptacion(marcado) {
  return {
    valido: Boolean(marcado),
    mensaje: "Debes aceptar los términos para continuar.",
  };
}

/**
 * Muestra u oculta el mensaje de error asociado a un campo.
 * Convención: el <small> de error debe tener el id `error-<idCampo>`.
 * @param {string} idCampo - id del input.
 * @param {{valido: boolean, mensaje: string}} resultado
 */
function mostrarError(idCampo, resultado) {
  const input = document.getElementById(idCampo);
  const contenedorError = document.getElementById(`error-${idCampo}`);

  if (!input) return;

  if (resultado.valido) {
    input.setAttribute("aria-invalid", "false");
    if (contenedorError) {
      contenedorError.textContent = "";
      contenedorError.classList.remove("visible");
    }
  } else {
    input.setAttribute("aria-invalid", "true");
    if (contenedorError) {
      contenedorError.textContent = resultado.mensaje;
      contenedorError.classList.add("visible");
    }
  }
}

/**
 * Muestra un mensaje general de estado (éxito o error) en el formulario.
 * @param {string} idContenedor - id del elemento contenedor del mensaje.
 * @param {string} texto
 * @param {"exito"|"error"} tipo
 */
function mostrarMensajeEstado(idContenedor, texto, tipo) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  contenedor.textContent = texto;
  contenedor.classList.remove("mensaje-estado--exito", "mensaje-estado--error");
  contenedor.classList.add("visible", `mensaje-estado--${tipo}`);
}

// Se exportan las funciones como propiedades de un objeto global
// `Validaciones` para poder usarlas desde login.html, registro.html
// y recuperar.html sin necesidad de un bundler ni módulos ES.
window.Validaciones = {
  validarRequerido,
  validarCorreo,
  validarContrasenaSegura,
  validarCoincidenciaContrasena,
  validarAceptacion,
  mostrarError,
  mostrarMensajeEstado,
};
