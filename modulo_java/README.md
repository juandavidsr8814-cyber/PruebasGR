# Módulo Java: contacto con el anfitrión (servlets y JSP)

Módulo de GranReserva hecho con Java, servlets y JSP. Requiere JDK 11+ y Apache Tomcat 9.

## Archivos
- `src/main/webapp/contacto.html`: formulario POST (contacto) y formulario GET (buscar salones).
- `src/main/java/co/granreserva/servlet/ContactoServlet.java`: `doPost` y `doGet`.
- `src/main/webapp/resultado.jsp` y `salones.jsp`: vistas JSP.
- `src/main/java/co/granreserva/modelo/`: `Salon` y `Contacto`.

## Cómo ejecutarlo
**Con Maven y Tomcat 9:**
1. `cd modulo_java`
2. `mvn clean package` (genera `target/granreserva.war`)
3. Copia el `.war` a la carpeta `webapps` de Tomcat 9 e inicia Tomcat.
4. Abre http://localhost:8080/granreserva/

**Con NetBeans, Eclipse o IntelliJ:** abre la carpeta como proyecto Maven web, agrega Tomcat 9 como servidor y ejecútalo.

> Con Tomcat 10 o superior hay que cambiar `javax.servlet` por `jakarta.servlet` en el código.

## Rutas
- `GET  /contacto` → todos los salones
- `GET  /contacto?capacidad=100` → salones con capacidad mínima
- `POST /contacto` → recibe el formulario (nombre, correo, salon, mensaje)
