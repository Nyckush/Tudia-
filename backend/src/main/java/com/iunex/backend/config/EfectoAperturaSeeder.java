package com.iunex.backend.config;

import com.iunex.backend.entity.EfectoApertura;
import com.iunex.backend.repository.EfectoAperturaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Order(2)
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class EfectoAperturaSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(EfectoAperturaSeeder.class);

    private final EfectoAperturaRepository efectoAperturaRepository;

    public EfectoAperturaSeeder(EfectoAperturaRepository efectoAperturaRepository) {
        this.efectoAperturaRepository = efectoAperturaRepository;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("globos-explosion", "Explosión de globos", "Cuatro explosiones de globos de colores.", Map.of("cantidadExplosiones", 4, "particulasPorExplosion", 25, "duracionMs", 2600));
        crearSiNoExiste("fuegos-artificiales", "Fuegos artificiales", "Cuatro estallidos radiales de chispas luminosas.", Map.of("cantidadExplosiones", 4, "particulasPorExplosion", 78, "duracionMs", 1800));
        crearSiNoExiste("confeti", "Confeti de colores", "Cuatro ráfagas de confeti multicolor.", Map.of("cantidadExplosiones", 4, "particulasPorExplosion", 28, "duracionMs", 1800));
        desactivarSiExiste("lluvia-estrellas");
    }

    private void crearSiNoExiste(String clave, String nombre, String descripcion, Map<String, Object> configuracionBase) {
        if (efectoAperturaRepository.existsByClave(clave)) return;

        EfectoApertura efecto = new EfectoApertura();
        efecto.setClave(clave);
        efecto.setNombre(nombre);
        efecto.setDescripcion(descripcion);
        efecto.setConfiguracionBase(configuracionBase);
        efecto.setActivo(true);
        efectoAperturaRepository.save(efecto);
        LOGGER.info("Efecto de apertura '{}' creado correctamente.", nombre);
    }

    private void desactivarSiExiste(String clave) {
        efectoAperturaRepository.findByClave(clave).ifPresent(efecto -> {
            if (!efecto.isActivo()) return;
            efecto.setActivo(false);
            efectoAperturaRepository.save(efecto);
            LOGGER.info("El efecto de apertura '{}' fue trasladado a los efectos de fondo.", efecto.getNombre());
        });
    }
}
