package com.iunex.backend.service;

import com.iunex.backend.dto.plantilla.PlantillaDisenoResponse;

import java.util.List;
import java.util.UUID;

public interface PlantillaDisenoService {

    List<PlantillaDisenoResponse> listarActivas();

    PlantillaDisenoResponse obtenerPorId(UUID id);
}
