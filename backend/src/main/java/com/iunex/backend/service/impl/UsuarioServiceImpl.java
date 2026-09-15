package com.iunex.backend.service.impl;

import com.iunex.backend.dto.usuario.CrearUsuarioRequest;
import com.iunex.backend.dto.usuario.UsuarioResponse;
import com.iunex.backend.entity.Usuario;
import com.iunex.backend.exception.CredencialesInvalidasException;
import com.iunex.backend.repository.UsuarioRepository;
import com.iunex.backend.service.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UsuarioResponse crear(CrearUsuarioRequest request) {
        String correo = normalizarCorreo(request.correo());
        String username = normalizarUsername(request.username());
        if (usuarioRepository.existsByCorreo(correo)) {
            throw new IllegalArgumentException("Ya existe un usuario con ese correo.");
        }
        if (usuarioRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("El nombre de usuario ya está en uso.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setCorreo(correo);
        usuario.setUsername(username);
        usuario.setContrasenaHash(passwordEncoder.encode(request.contrasena()));

        return aResponse(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse iniciarSesion(String username, String contrasena) {
        Usuario usuario = usuarioRepository.findByUsername(normalizarUsername(username))
                .orElseThrow(CredencialesInvalidasException::new);

        if (!passwordEncoder.matches(contrasena, usuario.getContrasenaHash())) {
            throw new CredencialesInvalidasException();
        }

        return aResponse(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(UUID id) {
        return aResponse(buscarEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(this::aResponse).toList();
    }

    @Override
    public void eliminar(UUID id) {
        usuarioRepository.delete(buscarEntidad(id));
    }

    private Usuario buscarEntidad(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado."));
    }

    private UsuarioResponse aResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(), usuario.getNombre(), usuario.getCorreo(), usuario.getUsername(), usuario.getCreadoEn()
        );
    }

    private String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizarUsername(String username) {
        return username.trim().toLowerCase(Locale.ROOT);
    }
}
