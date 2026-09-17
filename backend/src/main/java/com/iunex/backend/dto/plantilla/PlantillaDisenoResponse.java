package com.iunex.backend.dto.plantilla;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record PlantillaDisenoResponse(
        UUID id,
        String nombre,
        String descripcion,
        String colorPrimario,
        String colorSecundario,
        String imagenPortadaUrl,
        String tipoAnimacion,
        UUID efectoFondoPredeterminadoId,
        UUID efectoAperturaPredeterminadoId,
        Map<String, Object> configuracionBase,
        boolean activo,
        LocalDateTime creadoEn
) {
}
