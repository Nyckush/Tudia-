package com.iunex.backend.dto.efecto;

import java.util.Map;
import java.util.UUID;

public record EfectoFondoResponse(
        UUID id,
        String clave,
        String nombre,
        String descripcion,
        Map<String, Object> configuracionBase
) {
}
