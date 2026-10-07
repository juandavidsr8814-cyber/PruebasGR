const mongoose = require("mongoose");

const esquemaSalon = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, required: true, trim: true },
    capacidad: { type: Number, required: true, min: 1 },
    ubicacion: { type: String, required: true, trim: true },
    precio: { type: Number, required: true, min: 0 },
    extras: { type: [String], default: [] },
    fotos: { type: [String], default: [] },
    diasMinimo: { type: Number, default: 1, min: 1 },
    tiempoMinimo: { type: String, default: "4 horas" },
    pagoOnline: { type: Boolean, default: false },
    pagoPresencial: { type: Boolean, default: true },
    anfitrion: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    estado: { type: String, enum: ["publicado", "oculto"], default: "publicado" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salon", esquemaSalon);