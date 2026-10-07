# GranReserva — Plataforma de reservas de salones

Proyecto completo con dos partes independientes:

```
granreserva/
├── backend/     API en Node.js + Express + MongoDB (Mongoose), con autenticación JWT
└── frontend/    Sitio web en HTML, CSS y JavaScript puro
```

## Roles

| Rol         | Qué puede hacer                                                                 |
|-------------|----------------------------------------------------------------------------------|
| `cliente`   | Explorar salones, solicitar reservas, ver el estado de sus solicitudes, escribir mensajes al anfitrión. |
| `anfitrion` | Publicar, editar y eliminar sus salones; ver, aceptar o rechazar solicitudes; responder mensajes. |

---

## 1. Backend

### Requisitos
- Node.js 18 o superior.
- Un clúster gratuito de [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).

### Puesta en marcha

```bash
cd backend
npm install
cp .env.example .env        # en Windows PowerShell: copy .env.example .env
```

Abre el archivo `.env` y completa **tus propios valores**:

| Variable          | Qué poner                                                                                  |
|-------------------|---------------------------------------------------------------------------------------------|
| `MONGODB_URI`     | La cadena de conexión de tu clúster de Atlas (con el nombre de base `reservas_salones`).    |
| `PORT`            | `4000` (el frontend está configurado para este puerto).                                     |
| `FRONTEND_ORIGIN` | La URL exacta desde la que abres el frontend. Con Live Server: `http://127.0.0.1:5500`.     |
| `JWT_SECRET`      | Una clave larga y aleatoria. Para generar una: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRA`      | Duración de la sesión, por ejemplo `2h`.                                                    |

Inicia el servidor:

```bash
npm run dev      # se reinicia solo al guardar cambios
# o
npm start
```

Debes ver en la terminal:

```
✅ MongoDB conectado exitosamente
🚀 Servidor escuchando en http://localhost:4000
```

> **Seguridad:** el archivo `.env` contiene credenciales y **nunca** debe subirse a un
> repositorio (ya está en `.gitignore`). Si alguna vez una contraseña quedó escrita en un
> archivo compartido, cámbiala en Atlas (Database Access → Edit User → Edit Password).

### Autenticación

El login (`POST /api/auth/login`) devuelve un **token JWT**. Para usar las rutas
protegidas, el cliente debe enviarlo en cada petición:

```
Authorization: Bearer <token>
```

El servidor toma la identidad y el rol **del token**; ya no se acepta un correo enviado
en el body o la URL como prueba de quién hace la petición.

### Endpoints

| Método | Ruta                          | Acceso              | Descripción                                        |
|--------|-------------------------------|---------------------|-----------------------------------------------------|
| GET    | `/api/salud`                  | Público             | Verifica que el servidor está activo.               |
| POST   | `/api/auth/registro`          | Público             | Crea un usuario (`nombre, correo, contrasena, rol`).|
| POST   | `/api/auth/login`             | Público             | Devuelve `usuario` y `token`.                       |
| POST   | `/api/auth/recuperar`         | Público             | Simula el envío del enlace de recuperación.         |
| GET    | `/api/salones`                | Público             | Lista los salones publicados.                       |
| GET    | `/api/salones/:id`            | Público             | Detalle de un salón publicado.                      |
| GET    | `/api/salones/mis-salones`    | Anfitrión           | Salones del anfitrión autenticado.                  |
| POST   | `/api/salones`                | Anfitrión           | Publica un salón (acepta `fotos` como arreglo de imágenes en base64). |
| PUT    | `/api/salones/:id`            | Anfitrión (dueño)   | Edita un salón. Si no se envía `fotos`, se conservan las actuales. |
| DELETE | `/api/salones/:id`            | Anfitrión (dueño)   | Elimina un salón.                                   |
| POST   | `/api/reservas`               | Cliente             | Solicita una reserva (`salonId, fecha, invitados, mensaje`). |
| GET    | `/api/reservas/cliente`       | Cliente             | Reservas del cliente autenticado.                   |
| GET    | `/api/reservas/anfitrion`     | Anfitrión           | Solicitudes recibidas por el anfitrión.             |
| PATCH  | `/api/reservas/:id/estado`    | Anfitrión (dueño)   | Acepta o rechaza (`{ "estado": "aceptada" \| "rechazada" }`). |
| POST   | `/api/reservas/:id/mensajes`  | Cliente o anfitrión de la reserva | Agrega un mensaje (`{ "mensaje": "..." }`). |

Todas las respuestas usan el formato `{ "ok": true|false, "mensaje": "...", ... }`.

Códigos que puede devolver una ruta protegida: `401` (sin token o token inválido/vencido),
`403` (el rol no tiene permiso) y `404` (el recurso no existe o no te pertenece).

### Probar con Postman

1. `POST http://localhost:4000/api/auth/login` con body JSON `{ "correo": "...", "contrasena": "..." }`.
2. Copia el valor de `token` de la respuesta.
3. En cualquier ruta protegida, pestaña **Authorization** → tipo **Bearer Token** → pega el token.

### Estructura

```
backend/
├── server.js                       Punto de entrada
├── package.json
├── .env.example                    Plantilla de variables de entorno
└── src/
    ├── app.js                      Express: CORS, JSON, rutas y errores
    ├── config/database.js          Conexión a MongoDB
    ├── models/                     Usuario, Salon, Reserva (Mongoose)
    ├── controllers/                authController, salonController, reservaController
    ├── routes/                     authRoutes, salonRoutes, reservaRoutes
    └── middlewares/
        ├── autenticacion.js        verificarToken y autorizarRol (JWT)
        └── manejoErrores.js        404 y errores no controlados
```

---

## 2. Frontend

No necesita instalación. Sírvelo con **Live Server** (extensión de VS Code) desde la
carpeta `frontend`, abriendo `home.html` con clic derecho → *Open with Live Server*.

Importante: entra siempre con la misma URL que pusiste en `FRONTEND_ORIGIN`
(`http://127.0.0.1:5500`). Si abres `http://localhost:5500`, el navegador bloqueará las
peticiones al backend por CORS.

El frontend espera el backend en `http://localhost:4000` (constante `URL_BACKEND` al
inicio de `js/auth.js`).

### Estructura

```
frontend/
├── home.html                Inicio: búsqueda y salones destacados
├── login.html               Iniciar sesión
├── registro.html            Crear cuenta (cliente o anfitrión)
├── recuperar.html           Recuperar contraseña
├── detalle-salon.html       Detalle del salón y solicitud de reserva
├── panel-cliente.html       Mis reservas y mensajes (cliente)
├── panel-anfitrion.html     Mis salones y solicitudes (anfitrión)
├── crear-salon.html         Crear / editar publicación (anfitrión)
├── css/
│   └── estilos.css          Hoja de estilos única
└── js/
    ├── auth.js              Único punto de comunicación con el API y manejo de sesión/token
    ├── validaciones.js      Validaciones de formularios
    ├── login.js  registro.js  recuperar.js
```

Toda llamada al backend pasa por `Auth` (`js/auth.js`), que adjunta el token
automáticamente. Ninguna página llama a `fetch` directamente.

### Mejoras de experiencia agregadas

- **Sesión vencida:** si el token deja de ser válido (expiró, o cambiaste `JWT_SECRET`
  en el servidor), `auth.js` cierra la sesión sola y redirige a `login.html` con un
  aviso, en vez de dejar pantallas con errores sin explicación.
- **Errores diferenciados:** al fallar una carga (salones, solicitudes, reservas), la
  página distingue un problema de conexión (con botón "Reintentar") de un error de
  permisos o de datos, en lugar de mostrar siempre el mismo texto genérico.
- **"Próximamente" en Reseñas e Historial de clientes:** esas dos secciones del panel
  de anfitrión están marcadas explícitamente como no disponibles todavía, para no dar
  a entender que están vacías por falta de reservas.
- **Modal de confirmación propio:** eliminar un salón, o aceptar/rechazar una
  solicitud, usa un modal con el mismo estilo del sitio en vez del `confirm()` nativo
  del navegador.
- **Aviso de solicitudes pendientes:** un contador junto al enlace "Solicitudes" del
  panel de anfitrión, visible sin necesidad de bajar a esa sección.
- **Precio consistente:** el mismo formato de moneda (`$1.500.000`, sin decimales) en
  el inicio, el detalle del salón y el panel de anfitrión. El inicio ahora también
  muestra el precio en cada tarjeta.
