package com.iunex.backend.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActualizarUsuarioRequest(
        @NotBlank @Size(max = 120) String nombre,
        @NotBlank @Email @Size(max = 255) String correo,
        @NotBlank @Size(min = 3, max = 50) String username,
        @Size(max = 500) String fotoPerfil
) {
}
