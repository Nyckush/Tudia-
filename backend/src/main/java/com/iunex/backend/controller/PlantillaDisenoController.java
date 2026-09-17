package com.iunex.backend.controller;

import com.iunex.backend.dto.plantilla.PlantillaDisenoResponse;
import com.iunex.backend.service.PlantillaDisenoService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/plantillas-diseno")
public class PlantillaDisenoController {

    private final PlantillaDisenoService plantillaDisenoService;

    public PlantillaDisenoController(PlantillaDisenoService plantillaDisenoService) {
        this.plantillaDisenoService = plantillaDisenoService;
    }

    @GetMapping
    public List<PlantillaDisenoResponse> listarActivas() {
        return plantillaDisenoService.listarActivas();
    }

    @GetMapping("/{id}")
    public PlantillaDisenoResponse obtenerPorId(@PathVariable UUID id) {
        return plantillaDisenoService.obtenerPorId(id);
    }
}
