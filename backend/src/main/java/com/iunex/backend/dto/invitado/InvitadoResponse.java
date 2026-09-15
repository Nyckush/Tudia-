package com.iunex.backend.dto.invitado;

import java.time.LocalDateTime;
import java.util.UUID;

public record InvitadoResponse(
        UUID id,
        UUID eventoId,
        String nombre,
        String telefono,
        String estadoConfirmacion,
        Integer acompanantesPermitidos,
        Integer acompanantesConfirmados,
        String nota,
        LocalDateTime respondidoEn
) {
}
