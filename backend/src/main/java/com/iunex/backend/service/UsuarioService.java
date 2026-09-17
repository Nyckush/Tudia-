package com.iunex.backend.service;

import com.iunex.backend.dto.usuario.CrearUsuarioRequest;
import com.iunex.backend.dto.usuario.ActualizarUsuarioRequest;
import com.iunex.backend.dto.usuario.UsuarioResponse;

import java.util.List;
import java.util.UUID;

public interface UsuarioService {

    UsuarioResponse crear(CrearUsuarioRequest request);

    UsuarioResponse iniciarSesion(String username, String contrasena);

    UsuarioResponse obtenerPorId(UUID id);

    UsuarioResponse actualizar(UUID id, ActualizarUsuarioRequest request);

    List<UsuarioResponse> listar();

    void eliminar(UUID id);
}
