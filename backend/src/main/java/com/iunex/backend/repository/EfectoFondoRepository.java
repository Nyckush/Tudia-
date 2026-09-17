package com.iunex.backend.repository;

import com.iunex.backend.entity.EfectoFondo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EfectoFondoRepository extends JpaRepository<EfectoFondo, UUID> {

    boolean existsByClave(String clave);

    Optional<EfectoFondo> findByClave(String clave);

    List<EfectoFondo> findAllByActivoTrueOrderByNombreAsc();
}
