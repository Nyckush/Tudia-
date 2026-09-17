package com.iunex.backend.dto.evento;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record InvitacionEventoResponse(
        String nombreCumpleanero,
        LocalDateTime fechaHoraEvento,
        String nombreLugar,
        String direccion,
        BigDecimal latitud,
        BigDecimal longitud,
        UUID plantillaDisenoId,
        String nombrePlantilla,
        String colorPrimario,
        String colorSecundario,
        String imagenPortadaUrl,
        String tipoAnimacion,
        String efectoFondoClave,
        String efectoAperturaClave,
        Map<String, Object> configuracionDiseno
) {
}
