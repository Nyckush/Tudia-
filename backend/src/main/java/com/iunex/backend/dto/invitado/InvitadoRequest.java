package com.iunex.backend.dto.invitado;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record InvitadoRequest(
        @NotNull UUID eventoId,
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 30) String telefono,
        @NotBlank @Size(max = 20) String estadoConfirmacion,
        @NotNull @Min(0) Integer acompanantesPermitidos,
        @NotNull @Min(0) Integer acompanantesConfirmados,
        String nota
) {
}
