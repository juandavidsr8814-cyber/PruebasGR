/**
 * database.js
 * ---------------------------------------------------------------
 * Configuración y conexión a la base de datos MongoDB (Atlas)
 * usando Mongoose.
 * ---------------------------------------------------------------
 */

const mongoose = require("mongoose");

/**
 * Se conecta a MongoDB usando la URI definida en la variable de
 * entorno MONGODB_URI. Si la conexión falla, se detiene el proceso
 * para no dejar el servidor corriendo sin base de datos.
 */
async function conectarBaseDeDatos() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      "❌ No se encontró la variable de entorno MONGODB_URI. Revisa tu archivo .env"
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB conectado exitosamente");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error.message);
    process.exit(1);
  }
}

module.exports = conectarBaseDeDatos;
