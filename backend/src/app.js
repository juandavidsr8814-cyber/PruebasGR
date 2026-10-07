/**
 * app.js
 * ---------------------------------------------------------------
 * Configuración de la aplicación Express: middlewares globales,
 * rutas y manejo de errores. No inicia el servidor (eso lo hace
 * server.js), lo que facilita hacer pruebas automatizadas más
 * adelante si se necesitan.
 * ---------------------------------------------------------------
 */

const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const salonRoutes = require("./routes/salonRoutes");
const reservaRoutes = require("./routes/reservaRoutes");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/manejoErrores");

const app = express();

// CAMBIO (ajuste de seguridad): antes, si no existía la variable
// FRONTEND_ORIGIN, el servidor aceptaba peticiones de CUALQUIER
// origen ("*"). Ahora es obligatorio definirla; si falta, el
// servidor avisa en consola y usa un origen local por defecto en
// vez de abrirse a todo internet.
if (!process.env.FRONTEND_ORIGIN) {
  console.warn(
    "⚠️  No se definió FRONTEND_ORIGIN en tu .env. Usando http://127.0.0.1:5500 por defecto; defínela para tu entorno real."
  );
}

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://127.0.0.1:5500",
  })
);

// Límite ampliado a 10 MB: las fotos de los salones viajan como imágenes
// comprimidas en base64 dentro del JSON (el límite por defecto es 100 KB).
app.use(express.json({ limit: "10mb" }));

// Ruta de salud, útil para confirmar que el servidor está vivo.
app.get("/api/salud", (req, res) => {
  res.json({ ok: true, mensaje: "El servidor está funcionando." });
});

app.use("/api/auth", authRoutes);
app.use("/api/salones", salonRoutes);
app.use("/api/reservas", reservaRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

module.exports = app;
