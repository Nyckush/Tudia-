package com.iunex.backend.repository;

import com.iunex.backend.entity.Evento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventoRepository extends JpaRepository<Evento, UUID> {

    List<Evento> findAllByUsuarioId(UUID usuarioId);

    boolean existsByEnlacePublico(String enlacePublico);

    Optional<Evento> findByEnlacePublico(String enlacePublico);
}
