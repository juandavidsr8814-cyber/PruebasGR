<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List, java.time.format.DateTimeFormatter, co.granreserva.modelo.Contacto, co.granreserva.util.Texto" %>
<%--
  resultado.jsp
  Vista JSP: muestra el resultado del formulario recibido por doPost.
--%>
<%
    List<String> errores = (List<String>) request.getAttribute("errores");
    Contacto contacto = (Contacto) request.getAttribute("contacto");
    Integer total = (Integer) request.getAttribute("total");
    boolean hayErrores = errores != null && !errores.isEmpty();
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Resultado | GranReserva</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f3f7f1; color: #24331f; margin: 0; }
    main { max-width: 560px; margin: 32px auto; background: #fff; padding: 28px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
    h1 { margin-top: 0; }
    .ok { color: #2f6b2f; }
    .error { color: #a12626; }
    ul { padding-left: 20px; }
    dt { font-weight: bold; margin-top: 10px; }
    dd { margin: 4px 0 0; }
    a { color: #2f6b2f; }
  </style>
</head>
<body>
  <main>
    <% if (hayErrores) { %>
      <h1 class="error">No se pudo enviar el mensaje</h1>
      <ul>
        <% for (String error : errores) { %>
          <li><%= Texto.escapar(error) %></li>
        <% } %>
      </ul>
      <p><a href="contacto.html">← Corregir el formulario</a></p>
    <% } else { %>
      <h1 class="ok">¡Mensaje enviado!</h1>
      <p>El anfitrión recibió tu mensaje.</p>
      <dl>
        <dt>Nombre</dt><dd><%= Texto.escapar(contacto.getNombre()) %></dd>
        <dt>Correo</dt><dd><%= Texto.escapar(contacto.getCorreo()) %></dd>
        <dt>Salón</dt><dd><%= Texto.escapar(contacto.getSalon()) %></dd>
        <dt>Mensaje</dt><dd><%= Texto.escapar(contacto.getMensaje()) %></dd>
        <dt>Fecha</dt><dd><%= contacto.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) %></dd>
      </dl>
      <p>Mensajes recibidos desde que arrancó el servidor: <strong><%= total %></strong></p>
      <p><a href="contacto.html">← Enviar otro mensaje</a> · <a href="contacto">Ver salones</a></p>
    <% } %>
  </main>
</body>
</html>
