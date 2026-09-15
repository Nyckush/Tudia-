package com.iunex.backend.repository;

import com.iunex.backend.entity.Invitado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InvitadoRepository extends JpaRepository<Invitado, UUID> {

    List<Invitado> findAllByEventoId(UUID eventoId);

    boolean existsByTokenAcceso(String tokenAcceso);

    Optional<Invitado> findByTokenAcceso(String tokenAcceso);

    Optional<Invitado> findByTelefono(String telefono);

    boolean existsByTelefono(String telefono);
}
