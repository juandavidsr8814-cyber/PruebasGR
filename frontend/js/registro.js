/**
 * registro.js
 * ---------------------------------------------------------------
 * Controlador del formulario de registro (registro.html).
 * Valida cada campo, incluyendo la confirmación de contraseña y
 * la aceptación de términos, y delega la creación del usuario a
 * auth.js (window.Auth).
 * ---------------------------------------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("form-registro");

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const correo = document.getElementById("correo").value;
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmar-contrasena").value;
    const terminosAceptados = document.getElementById("terminos").checked;
    const rol = document.querySelector('input[name="rol"]:checked').value;

    // 1. Ejecutar todas las validaciones del formulario.
    const validaciones = {
      nombre: Validaciones.validarRequerido(nombre),
      correo: Validaciones.validarCorreo(correo),
      contrasena: Validaciones.validarContrasenaSegura(contrasena),
      "confirmar-contrasena": Validaciones.validarCoincidenciaContrasena(
        contrasena,
        confirmarContrasena
      ),
      terminos: Validaciones.validarAceptacion(terminosAceptados),
    };

    // 2. Mostrar el error correspondiente a cada campo.
    Object.entries(validaciones).forEach(([idCampo, resultado]) => {
      Validaciones.mostrarError(idCampo, resultado);
    });

    const formularioValido = Object.values(validaciones).every((r) => r.valido);

    if (!formularioValido) {
      return;
    }

    // 3. Registrar al usuario mediante el API.
    const resultadoRegistro = await Auth.registrarUsuario({
      nombre,
      correo,
      contrasena,
      rol,
    });

    if (resultadoRegistro.ok) {
      Validaciones.mostrarMensajeEstado("mensaje-registro", resultadoRegistro.mensaje, "exito");
      formulario.reset();
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      Validaciones.mostrarMensajeEstado("mensaje-registro", resultadoRegistro.mensaje, "error");
    }
  });
});
