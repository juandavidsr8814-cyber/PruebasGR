package co.granreserva.servlet;

import co.granreserva.modelo.Contacto;
import co.granreserva.modelo.Salon;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * ContactoServlet.java
 * Módulo "Contacto con el anfitrión" de GranReserva.
 *
 *  - doGet : recibe el parámetro "capacidad" (opcional) y muestra los salones
 *            que tienen esa capacidad o más (vista salones.jsp).
 *  - doPost: recibe los campos del formulario contacto.html, los valida y
 *            guarda el mensaje (vista resultado.jsp).
 */
@WebServlet(name = "ContactoServlet", urlPatterns = {"/contacto"})
public class ContactoServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private static final String ATRIBUTO_CONTACTOS = "contactos";
    private static final int MAXIMO_NOMBRE = 80;
    private static final int MAXIMO_CORREO = 120;
    private static final int MAXIMO_MENSAJE = 500;
    private static final Pattern PATRON_CORREO =
            Pattern.compile("^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");

    /** GET: consulta de salones filtrada por el parámetro "capacidad". */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String textoCapacidad = request.getParameter("capacidad");
        int minimo = 0;
        String aviso = null;

        if (textoCapacidad != null && !textoCapacidad.trim().isEmpty()) {
            try {
                minimo = Integer.parseInt(textoCapacidad.trim());
                if (minimo < 0) {
                    minimo = 0;
                    aviso = "La capacidad no puede ser negativa; se muestran todos los salones.";
                }
            } catch (NumberFormatException e) {
                aviso = "La capacidad debe ser un número; se muestran todos los salones.";
            }
        }

        List<Salon> encontrados = new ArrayList<Salon>();
        for (Salon salon : Salon.catalogo()) {
            if (salon.getCapacidad() >= minimo) {
                encontrados.add(salon);
            }
        }

        request.setAttribute("salones", encontrados);
        request.setAttribute("minimo", minimo);
        request.setAttribute("aviso", aviso);
        request.getRequestDispatcher("/salones.jsp").forward(request, response);
    }

    /** POST: recibe y valida el formulario de contacto. */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        request.setCharacterEncoding("UTF-8");

        String nombre = limpiar(request.getParameter("nombre"));
        String correo = limpiar(request.getParameter("correo"));
        String salon = limpiar(request.getParameter("salon"));
        String mensaje = limpiar(request.getParameter("mensaje"));

        List<String> errores = new ArrayList<String>();
        if (nombre.length() < 3 || nombre.length() > MAXIMO_NOMBRE) {
            errores.add("El nombre debe tener entre 3 y " + MAXIMO_NOMBRE + " caracteres.");
        }
        if (correo.length() > MAXIMO_CORREO || !PATRON_CORREO.matcher(correo).matches()) {
            errores.add("El correo no tiene un formato válido.");
        }
        if (!existeSalon(salon)) {
            errores.add("Debes elegir un salón de la lista.");
        }
        if (mensaje.isEmpty()) {
            errores.add("El mensaje no puede estar vacío.");
        } else if (mensaje.length() > MAXIMO_MENSAJE) {
            errores.add("El mensaje no puede pasar de " + MAXIMO_MENSAJE + " caracteres.");
        }

        Contacto contacto = null;
        if (errores.isEmpty()) {
            contacto = new Contacto(nombre, correo, salon, mensaje);
            guardar(contacto);
        }

        request.setAttribute("errores", errores);
        request.setAttribute("contacto", contacto);
        request.setAttribute("total", contarContactos());
        request.getRequestDispatcher("/resultado.jsp").forward(request, response);
    }

    /** Comprueba que el nombre del salón exista en el catálogo. */
    private boolean existeSalon(String nombreSalon) {
        for (Salon salon : Salon.catalogo()) {
            if (salon.getNombre().equals(nombreSalon)) {
                return true;
            }
        }
        return false;
    }

    /** Quita espacios y convierte null en cadena vacía. */
    private String limpiar(String valor) {
        return valor == null ? "" : valor.trim();
    }

    /** Guarda el contacto en el contexto de la aplicación (memoria del servidor). */
    private void guardar(Contacto contacto) {
        ServletContext contexto = getServletContext();
        synchronized (contexto) {
            List<Contacto> lista = obtenerLista(contexto);
            if (lista == null) {
                lista = new ArrayList<Contacto>();
                contexto.setAttribute(ATRIBUTO_CONTACTOS, lista);
            }
            lista.add(contacto);
        }
    }

    private int contarContactos() {
        ServletContext contexto = getServletContext();
        synchronized (contexto) {
            List<Contacto> lista = obtenerLista(contexto);
            return lista == null ? 0 : lista.size();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Contacto> obtenerLista(ServletContext contexto) {
        return (List<Contacto>) contexto.getAttribute(ATRIBUTO_CONTACTOS);
    }
}
