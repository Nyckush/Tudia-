package com.iunex.backend.dto.efecto;

import java.util.Map;
import java.util.UUID;

public record EfectoAperturaResponse(
        UUID id,
        String clave,
        String nombre,
        String descripcion,
        Map<String, Object> configuracionBase
) {
}
