package com.iunex.backend.dto.evento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvitacionEventoResponse(
        String nombreCumpleanero,
        LocalDateTime fechaHoraEvento,
        String nombreLugar,
        String direccion,
        BigDecimal latitud,
        BigDecimal longitud
) {
}
