const mongoose = require("mongoose");

const esquemaReserva = new mongoose.Schema(
  {
    salon: { type: mongoose.Schema.Types.ObjectId, ref: "Salon", required: true },
    cliente: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    anfitrion: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
    fecha: { type: Date, required: true },
    invitados: { type: Number, required: true, min: 1 },
    mensaje: { type: String, trim: true, maxlength: 500, default: "" },
    estado: { type: String, enum: ["pendiente", "aceptada", "rechazada"], default: "pendiente" },
    mensajes: {
      type: [{
        autor: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
        texto: { type: String, required: true, trim: true, maxlength: 500 },
        creadoEn: { type: Date, default: Date.now },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reserva", esquemaReserva);
