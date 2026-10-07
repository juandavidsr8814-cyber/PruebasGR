/**
 * Usuario.js
 * ---------------------------------------------------------------
 * Modelo de Mongoose para los usuarios de la plataforma.
 * Los tres actores (cliente, anfitrión, administrativo) se
 * representan con el mismo modelo, diferenciados por el campo "rol".
 * ---------------------------------------------------------------
 */

const mongoose = require("mongoose");

const esquemaUsuario = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    contrasena: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      // No se define un "select: false" para mantener el proyecto
      // simple, pero el controlador nunca debe devolver este campo
      // en las respuestas al front-end.
    },
    rol: {
      type: String,
      enum: ["cliente", "anfitrion", "administrativo"],
      default: "cliente",
    },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

module.exports = mongoose.model("Usuario", esquemaUsuario);
