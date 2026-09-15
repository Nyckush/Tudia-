package com.iunex.backend.dto.invitado;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ConfirmacionPublicaRequest(
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Size(max = 30) String telefono,
        @NotNull Boolean asiste,
        @NotNull @Min(0) Integer acompanantesConfirmados,
        String nota
) {
}
