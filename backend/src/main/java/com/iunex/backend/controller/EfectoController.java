package com.iunex.backend.controller;

import com.iunex.backend.dto.efecto.EfectoAperturaResponse;
import com.iunex.backend.dto.efecto.EfectoFondoResponse;
import com.iunex.backend.repository.EfectoAperturaRepository;
import com.iunex.backend.repository.EfectoFondoRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/efectos")
public class EfectoController {

    private final EfectoFondoRepository efectoFondoRepository;
    private final EfectoAperturaRepository efectoAperturaRepository;

    public EfectoController(EfectoFondoRepository efectoFondoRepository, EfectoAperturaRepository efectoAperturaRepository) {
        this.efectoFondoRepository = efectoFondoRepository;
        this.efectoAperturaRepository = efectoAperturaRepository;
    }

    @GetMapping("/fondo")
    public List<EfectoFondoResponse> listarFondos() {
        return efectoFondoRepository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(efecto -> new EfectoFondoResponse(efecto.getId(), efecto.getClave(), efecto.getNombre(), efecto.getDescripcion(), efecto.getConfiguracionBase()))
                .toList();
    }

    @GetMapping("/apertura")
    public List<EfectoAperturaResponse> listarAperturas() {
        return efectoAperturaRepository.findAllByActivoTrueOrderByNombreAsc().stream()
                .map(efecto -> new EfectoAperturaResponse(efecto.getId(), efecto.getClave(), efecto.getNombre(), efecto.getDescripcion(), efecto.getConfiguracionBase()))
                .toList();
    }
}
