package co.granreserva.util;

/**
 * Texto.java
 * Utilidades para texto. Escapa los caracteres especiales de HTML antes de
 * mostrar lo que escribió el usuario, para evitar inyección de código (XSS).
 */
public final class Texto {

    private Texto() { }

    public static String escapar(String texto) {
        if (texto == null) {
            return "";
        }
        StringBuilder salida = new StringBuilder(texto.length() + 16);
        for (int i = 0; i < texto.length(); i++) {
            char c = texto.charAt(i);
            switch (c) {
                case '&':  salida.append("&amp;");  break;
                case '<':  salida.append("&lt;");   break;
                case '>':  salida.append("&gt;");   break;
                case '"':  salida.append("&quot;"); break;
                case '\'': salida.append("&#39;");  break;
                default:   salida.append(c);
            }
        }
        return salida.toString();
    }
}
