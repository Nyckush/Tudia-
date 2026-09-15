package com.iunex.backend.controller;

import com.iunex.backend.dto.invitado.InvitadoRequest;
import com.iunex.backend.dto.invitado.InvitadoResponse;
import com.iunex.backend.service.InvitadoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class InvitadoController {

    private final InvitadoService invitadoService;

    public InvitadoController(InvitadoService invitadoService) {
        this.invitadoService = invitadoService;
    }

    @PostMapping("/invitados")
    public ResponseEntity<InvitadoResponse> crear(@Valid @RequestBody InvitadoRequest request) {
        InvitadoResponse invitado = invitadoService.crear(request);
        return ResponseEntity.created(URI.create("/api/invitados/" + invitado.id())).body(invitado);
    }

    @GetMapping("/invitados/{id}")
    public InvitadoResponse obtenerPorId(@PathVariable UUID id) {
        return invitadoService.obtenerPorId(id);
    }

    @GetMapping("/eventos/{eventoId}/invitados")
    public List<InvitadoResponse> listarPorEvento(@PathVariable UUID eventoId) {
        return invitadoService.listarPorEvento(eventoId);
    }

    @DeleteMapping("/invitados/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        invitadoService.eliminar(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
