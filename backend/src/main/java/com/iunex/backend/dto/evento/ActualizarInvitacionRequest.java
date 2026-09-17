package com.iunex.backend.dto.evento;

import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public record ActualizarInvitacionRequest(
        @NotNull UUID usuarioId,
        @NotNull Map<String, Object> configuracionDiseno,
        UUID efectoFondoId,
        UUID efectoAperturaId
) {
}
