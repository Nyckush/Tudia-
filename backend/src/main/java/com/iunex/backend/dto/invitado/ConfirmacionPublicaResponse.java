package com.iunex.backend.dto.invitado;

public record ConfirmacionPublicaResponse(
        String nombre,
        String estadoConfirmacion,
        Integer acompanantesConfirmados
) {
}
