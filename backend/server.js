/**
 * server.js
 * ---------------------------------------------------------------
 * Punto de entrada del backend. Carga las variables de entorno,
 * conecta a MongoDB y arranca el servidor Express.
 * ---------------------------------------------------------------
 */

require("dotenv").config();

const app = require("./src/app");
const conectarBaseDeDatos = require("./src/config/database");

const PUERTO = process.env.PORT || 4000;

async function iniciarServidor() {
  await conectarBaseDeDatos();

  app.listen(PUERTO, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PUERTO}`);
  });
}

iniciarServidor();
