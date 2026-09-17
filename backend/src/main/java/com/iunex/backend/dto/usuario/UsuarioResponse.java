package com.iunex.backend.dto.usuario;

import java.time.LocalDateTime;
import java.util.UUID;

public record UsuarioResponse(UUID id, String nombre, String correo, String username, String fotoPerfil, LocalDateTime creadoEn) {
}
