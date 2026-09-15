package com.iunex.backend.controller;

import com.iunex.backend.dto.auth.LoginRequest;
import com.iunex.backend.dto.usuario.UsuarioResponse;
import com.iunex.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public UsuarioResponse iniciarSesion(@Valid @RequestBody LoginRequest request) {
        return usuarioService.iniciarSesion(request.username(), request.contrasena());
    }
}
