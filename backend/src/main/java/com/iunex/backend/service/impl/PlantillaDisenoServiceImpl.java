package com.iunex.backend.service.impl;

import com.iunex.backend.dto.plantilla.PlantillaDisenoResponse;
import com.iunex.backend.entity.PlantillaDiseno;
import com.iunex.backend.repository.PlantillaDisenoRepository;
import com.iunex.backend.service.PlantillaDisenoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PlantillaDisenoServiceImpl implements PlantillaDisenoService {

    private final PlantillaDisenoRepository plantillaDisenoRepository;

    public PlantillaDisenoServiceImpl(PlantillaDisenoRepository plantillaDisenoRepository) {
        this.plantillaDisenoRepository = plantillaDisenoRepository;
    }

    @Override
    public List<PlantillaDisenoResponse> listarActivas() {
        return plantillaDisenoRepository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(this::aResponse)
                .toList();
    }

    @Override
    public PlantillaDisenoResponse obtenerPorId(UUID id) {
        return aResponse(plantillaDisenoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plantilla de diseño no encontrada.")));
    }

    private PlantillaDisenoResponse aResponse(PlantillaDiseno plantilla) {
        return new PlantillaDisenoResponse(
                plantilla.getId(), plantilla.getNombre(), plantilla.getDescripcion(),
                plantilla.getColorPrimario(), plantilla.getColorSecundario(), plantilla.getImagenPortadaUrl(),
                plantilla.getTipoAnimacion(),
                plantilla.getEfectoFondoPredeterminado() == null ? null : plantilla.getEfectoFondoPredeterminado().getId(),
                plantilla.getEfectoAperturaPredeterminado() == null ? null : plantilla.getEfectoAperturaPredeterminado().getId(),
                plantilla.getConfiguracionBase(), plantilla.isActivo(), plantilla.getCreadoEn()
        );
    }
}
