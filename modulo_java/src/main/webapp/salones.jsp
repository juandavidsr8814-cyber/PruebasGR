<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.List, co.granreserva.modelo.Salon, co.granreserva.util.Texto" %>
<%--
  salones.jsp
  Vista JSP: muestra los salones que el servlet dejó en el request (doGet).
--%>
<%
    List<Salon> salones = (List<Salon>) request.getAttribute("salones");
    Integer minimo = (Integer) request.getAttribute("minimo");
    String aviso = (String) request.getAttribute("aviso");
%>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Salones | GranReserva</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f3f7f1; color: #24331f; margin: 0; }
    main { max-width: 720px; margin: 32px auto; background: #fff; padding: 28px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,.08); }
    h1 { color: #2f6b2f; margin-top: 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 10px; border-bottom: 1px solid #dfe8da; text-align: left; }
    th { background: #e6f0e1; }
    .aviso { background: #fff4d6; padding: 10px; border-radius: 6px; }
    a { color: #2f6b2f; }
  </style>
</head>
<body>
  <main>
    <h1>Salones disponibles</h1>

    <% if (aviso != null) { %>
      <p class="aviso"><%= Texto.escapar(aviso) %></p>
    <% } %>

    <p>Capacidad mínima: <strong>${minimo}</strong> personas ·
       Resultados: <strong>${salones.size()}</strong></p>

    <% if (salones == null || salones.isEmpty()) { %>
      <p>No hay salones con esa capacidad.</p>
    <% } else { %>
      <table>
        <tr><th>#</th><th>Salón</th><th>Ciudad</th><th>Capacidad</th><th>Precio por día</th></tr>
        <% for (Salon s : salones) { %>
          <tr>
            <td><%= s.getId() %></td>
            <td><%= Texto.escapar(s.getNombre()) %></td>
            <td><%= Texto.escapar(s.getCiudad()) %></td>
            <td><%= s.getCapacidad() %></td>
            <td>$<%= String.format("%,d", s.getPrecioPorDia()) %></td>
          </tr>
        <% } %>
      </table>
    <% } %>

    <p><a href="contacto.html">← Volver al formulario</a></p>
  </main>
</body>
</html>
