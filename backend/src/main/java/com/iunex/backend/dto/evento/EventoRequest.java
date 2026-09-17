package com.iunex.backend.dto.evento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public record EventoRequest(
        @NotNull UUID usuarioId,
        @NotBlank @Size(max = 120) String nombreCumpleanero,
        @NotNull LocalDate fechaNacimiento,
        @NotNull LocalDateTime fechaHoraEvento,
        @NotBlank @Size(max = 160) String nombreLugar,
        @NotBlank @Size(max = 255) String direccion,
        @NotNull BigDecimal latitud,
        @NotNull BigDecimal longitud,
        @NotBlank @Size(max = 20) String estado,
        UUID plantillaDisenoId,
        Map<String, Object> configuracionDiseno
) {
}
