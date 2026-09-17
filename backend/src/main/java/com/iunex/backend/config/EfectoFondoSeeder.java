package com.iunex.backend.config;

import com.iunex.backend.entity.EfectoFondo;
import com.iunex.backend.repository.EfectoFondoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Order(1)
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class EfectoFondoSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(EfectoFondoSeeder.class);

    private final EfectoFondoRepository efectoFondoRepository;

    public EfectoFondoSeeder(EfectoFondoRepository efectoFondoRepository) {
        this.efectoFondoRepository = efectoFondoRepository;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("globos", "Globos de colores", "Globos pequeños y translúcidos que flotan suavemente.", Map.of("duracionMs", 4000, "opacidadMaxima", 0.38, "tamano", "pequeno"));
        crearSiNoExiste("estrellas-fugaces", "Estrellas fugaces", "Destellos que recorren el fondo en diagonal.", Map.of("duracionMs", 4800, "cantidad", 3, "direccion", "diagonal"));
        crearSiNoExiste("lluvia-estrellas", "Lluvia de estrellas", "Estrellas blancas brillantes que caen suavemente como efecto ambiental.", Map.of("duracionMs", 5800, "cantidad", 17, "color", "#ffffff"));
        crearSiNoExiste("estrellas-doradas", "Estrellas doradas", "Estrellas doradas flotando con un brillo sutil.", Map.of("duracionMs", 4000, "cantidad", 7, "color", "#fbbf24"));
        crearSiNoExiste("puntos-de-luz", "Puntos de luz", "Pequeños puntos luminosos con aparición gradual.", Map.of("duracionMs", 4500, "cantidad", 7, "brillo", "suave"));
    }

    private void crearSiNoExiste(String clave, String nombre, String descripcion, Map<String, Object> configuracionBase) {
        if (efectoFondoRepository.existsByClave(clave)) return;

        EfectoFondo efecto = new EfectoFondo();
        efecto.setClave(clave);
        efecto.setNombre(nombre);
        efecto.setDescripcion(descripcion);
        efecto.setConfiguracionBase(configuracionBase);
        efecto.setActivo(true);
        efectoFondoRepository.save(efecto);
        LOGGER.info("Efecto de fondo '{}' creado correctamente.", nombre);
    }
}
