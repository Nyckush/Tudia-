package com.iunex.backend.repository;

import com.iunex.backend.entity.EfectoApertura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EfectoAperturaRepository extends JpaRepository<EfectoApertura, UUID> {

    boolean existsByClave(String clave);

    Optional<EfectoApertura> findByClave(String clave);

    List<EfectoApertura> findAllByActivoTrueOrderByNombreAsc();
}
