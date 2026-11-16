package co.granreserva.modelo;

import java.util.ArrayList;
import java.util.List;

/**
 * Salon.java
 * Clase del modelo: representa un salón de eventos de GranReserva.
 * En este módulo los salones están en memoria (datos de ejemplo); en el
 * proyecto completo (Node.js + MongoDB) vienen de la base de datos.
 */
public class Salon {

    private final int id;
    private final String nombre;
    private final String ciudad;
    private final int capacidad;
    private final int precioPorDia;

    public Salon(int id, String nombre, String ciudad, int capacidad, int precioPorDia) {
        this.id = id;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.capacidad = capacidad;
        this.precioPorDia = precioPorDia;
    }

    public int getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCiudad() { return ciudad; }
    public int getCapacidad() { return capacidad; }
    public int getPrecioPorDia() { return precioPorDia; }

    /** Catálogo de ejemplo con los salones que se muestran en el módulo. */
    public static List<Salon> catalogo() {
        List<Salon> lista = new ArrayList<Salon>();
        lista.add(new Salon(1, "Salón Jardín Botánico", "Bogotá", 120, 1800000));
        lista.add(new Salon(2, "Salón Terraza del Parque", "Medellín", 60, 950000));
        lista.add(new Salon(3, "Salón Casa Colonial", "Cartagena", 200, 3200000));
        lista.add(new Salon(4, "Salón Mirador", "Cali", 80, 1200000));
        lista.add(new Salon(5, "Salón Lago Azul", "Bogotá", 40, 700000));
        return lista;
    }
}
