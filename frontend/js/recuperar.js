/**
 * recuperar.js
 * ---------------------------------------------------------------
 * Controlador del formulario de recuperación de contraseña
 * (recuperar.html). Delega la lógica de "envío" del enlace a
 * auth.js (window.Auth), que en este componente front-end solo
 * simula la respuesta del servidor.
 * ---------------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-recuperar");

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = document.getElementById("correo").value;

    const resultadoCorreo = Validaciones.validarCorreo(correo);
    Validaciones.mostrarError("correo", resultadoCorreo);

    if (!resultadoCorreo.valido) {
      return;
    }

    const resultado = await Auth.solicitarRecuperacion(correo);
    Validaciones.mostrarMensajeEstado(
      "mensaje-recuperar",
      resultado.mensaje,
      resultado.ok ? "exito" : "error"
    );
    formulario.reset();
  });
});
