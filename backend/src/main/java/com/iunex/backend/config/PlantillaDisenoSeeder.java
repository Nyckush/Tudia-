package com.iunex.backend.config;

import com.iunex.backend.entity.PlantillaDiseno;
import com.iunex.backend.repository.EfectoAperturaRepository;
import com.iunex.backend.repository.EfectoFondoRepository;
import com.iunex.backend.repository.PlantillaDisenoRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@Order(3)
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class PlantillaDisenoSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(PlantillaDisenoSeeder.class);

    private final PlantillaDisenoRepository plantillaDisenoRepository;
    private final EfectoFondoRepository efectoFondoRepository;
    private final EfectoAperturaRepository efectoAperturaRepository;

    public PlantillaDisenoSeeder(PlantillaDisenoRepository plantillaDisenoRepository, EfectoFondoRepository efectoFondoRepository, EfectoAperturaRepository efectoAperturaRepository) {
        this.plantillaDisenoRepository = plantillaDisenoRepository;
        this.efectoFondoRepository = efectoFondoRepository;
        this.efectoAperturaRepository = efectoAperturaRepository;
    }

    @Override
    public void run(String... args) {
        crearSiNoExiste("Fiesta infantil", "Una invitación alegre y colorida para cumpleaños infantiles.", "#F97316", "#FEF3C7", "confeti", "globos", "globos-explosion", Map.of("tipografia", "alegre", "estiloTarjeta", "redondeada"));
        crearSiNoExiste("Elegante dorado", "Un estilo sobrio con detalles dorados para una celebración especial.", "#7C5C1E", "#FFF7E6", "brillos", "estrellas-doradas", "fuegos-artificiales", Map.of("tipografia", "serif", "estiloTarjeta", "clasica"));
        crearSiNoExiste("Minimalista", "Un diseño limpio y moderno que prioriza la información del evento.", "#1E293B", "#F8FAFC", "ninguna", "puntos-de-luz", "confeti", Map.of("tipografia", "moderna", "estiloTarjeta", "simple"));
        crearSiNoExiste("Noche neón", "Una invitación vibrante para festejos nocturnos y juveniles.", "#7C3AED", "#111827", "destellos", "estrellas-fugaces", "lluvia-estrellas", Map.of("tipografia", "urbana", "estiloTarjeta", "intensa"));
    }

    private void crearSiNoExiste(
            String nombre,
            String descripcion,
            String colorPrimario,
            String colorSecundario,
            String tipoAnimacion,
            String claveEfectoFondo,
            String claveEfectoApertura,
            Map<String, Object> configuracionBase
    ) {
        PlantillaDiseno plantilla = plantillaDisenoRepository.findByNombre(nombre).orElseGet(PlantillaDiseno::new);
        boolean esNueva = plantilla.getId() == null;
        if (esNueva) {
            plantilla.setNombre(nombre);
            plantilla.setDescripcion(descripcion);
            plantilla.setColorPrimario(colorPrimario);
            plantilla.setColorSecundario(colorSecundario);
            plantilla.setTipoAnimacion(tipoAnimacion);
            plantilla.setConfiguracionBase(configuracionBase);
            plantilla.setActivo(true);
        }
        plantilla.setEfectoFondoPredeterminado(efectoFondoRepository.findByClave(claveEfectoFondo).orElseThrow());
        plantilla.setEfectoAperturaPredeterminado(efectoAperturaRepository.findByClave(claveEfectoApertura).orElseThrow());
        plantillaDisenoRepository.save(plantilla);

        LOGGER.info("Plantilla de diseño '{}' {} correctamente.", nombre, esNueva ? "creada" : "actualizada");
    }
}
