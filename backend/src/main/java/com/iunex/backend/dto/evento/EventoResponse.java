package com.iunex.backend.dto.evento;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record EventoResponse(
        UUID id,
        UUID usuarioId,
        String nombreCumpleanero,
        LocalDate fechaNacimiento,
        LocalDateTime fechaHoraEvento,
        String nombreLugar,
        String direccion,
        BigDecimal latitud,
        BigDecimal longitud,
        String enlacePublico,
        String estado,
        UUID plantillaDisenoId,
        UUID efectoFondoId,
        UUID efectoAperturaId,
        Map<String, Object> configuracionDiseno,
        LocalDateTime creadoEn
) {
}
