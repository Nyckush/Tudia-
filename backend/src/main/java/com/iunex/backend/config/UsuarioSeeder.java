package com.iunex.backend.config;

import com.iunex.backend.entity.Usuario;
import com.iunex.backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class UsuarioSeeder implements CommandLineRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(UsuarioSeeder.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final String username;
    private final String nombre;
    private final String correo;
    private final String contrasena;

    public UsuarioSeeder(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed.usuario.username}") String username,
            @Value("${app.seed.usuario.nombre}") String nombre,
            @Value("${app.seed.usuario.correo}") String correo,
            @Value("${app.seed.usuario.contrasena}") String contrasena
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.username = username;
        this.nombre = nombre;
        this.correo = correo;
        this.contrasena = contrasena;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsByUsername(username) || usuarioRepository.existsByCorreo(correo)) {
            LOGGER.info("El usuario inicial ya existe; no se creó un duplicado.");
            return;
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setNombre(nombre);
        usuario.setCorreo(correo);
        usuario.setContrasenaHash(passwordEncoder.encode(contrasena));
        usuarioRepository.save(usuario);

        LOGGER.info("Usuario inicial '{}' creado correctamente.", username);
    }
}
