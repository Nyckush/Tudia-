package com.iunex.backend.repository;

import com.iunex.backend.entity.PlantillaDiseno;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;
import java.util.List;
import java.util.Optional;

public interface PlantillaDisenoRepository extends JpaRepository<PlantillaDiseno, UUID> {

    boolean existsByNombre(String nombre);

    Optional<PlantillaDiseno> findByNombre(String nombre);

    List<PlantillaDiseno> findAllByActivoTrueOrderByNombreAsc();
}
