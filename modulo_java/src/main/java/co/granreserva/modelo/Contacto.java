package co.granreserva.modelo;

import java.time.LocalDateTime;

/**
 * Contacto.java
 * Clase del modelo: mensaje que un cliente le envía al anfitrión de un salón.
 */
public class Contacto {

    private final String nombre;
    private final String correo;
    private final String salon;
    private final String mensaje;
    private final LocalDateTime fecha;

    public Contacto(String nombre, String correo, String salon, String mensaje) {
        this.nombre = nombre;
        this.correo = correo;
        this.salon = salon;
        this.mensaje = mensaje;
        this.fecha = LocalDateTime.now();
    }

    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public String getSalon() { return salon; }
    public String getMensaje() { return mensaje; }
    public LocalDateTime getFecha() { return fecha; }
}
