/**
 * login.js
 * ---------------------------------------------------------------
 * Controlador del formulario de inicio de sesión (login.html).
 * Depende de validaciones.js (window.Validaciones) y de
 * auth.js (window.Auth).
 * ---------------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-login");

  // Si llegamos aquí porque el token venció (auth.js cerró la sesión
  // sola), se muestra el aviso una sola vez.
  const mensajeSesion = Auth.leerMensajeSesion();
  if (mensajeSesion) {
    Validaciones.mostrarMensajeEstado("mensaje-login", mensajeSesion, "error");
  }

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;

    // 1. Validar campos antes de intentar autenticar.
    const resultadoCorreo = Validaciones.validarCorreo(correo);
    Validaciones.mostrarError("correo", resultadoCorreo);

    const resultadoContrasena = Validaciones.validarRequerido(contrasena);
    Validaciones.mostrarError("contrasena", resultadoContrasena);

    const formularioValido = resultadoCorreo.valido && resultadoContrasena.valido;

    if (!formularioValido) {
      return;
    }

    // 2. Intentar iniciar sesión con las credenciales ingresadas.
    const resultadoLogin = await Auth.iniciarSesion(correo, contrasena);

    if (resultadoLogin.ok) {
      Validaciones.mostrarMensajeEstado("mensaje-login", resultadoLogin.mensaje, "exito");
      formulario.reset();
      window.location.href = "home.html";
    } else {
      Validaciones.mostrarMensajeEstado("mensaje-login", resultadoLogin.mensaje, "error");
    }
  });
});
