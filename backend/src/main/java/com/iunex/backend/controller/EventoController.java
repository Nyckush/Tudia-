package com.iunex.backend.controller;

import com.iunex.backend.dto.evento.EventoRequest;
import com.iunex.backend.dto.evento.ActualizarInvitacionRequest;
import com.iunex.backend.dto.evento.EventoResponse;
import com.iunex.backend.dto.evento.InvitacionEventoResponse;
import com.iunex.backend.service.EventoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class EventoController {

    private final EventoService eventoService;

    public EventoController(EventoService eventoService) {
        this.eventoService = eventoService;
    }

    @PostMapping("/eventos")
    public ResponseEntity<EventoResponse> crear(@Valid @RequestBody EventoRequest request) {
        EventoResponse evento = eventoService.crear(request);
        return ResponseEntity.created(URI.create("/api/eventos/" + evento.id())).body(evento);
    }

    @GetMapping("/eventos/{id}")
    public EventoResponse obtenerPorId(@PathVariable UUID id) {
        return eventoService.obtenerPorId(id);
    }

    @PutMapping("/eventos/{id}/invitacion")
    public EventoResponse actualizarInvitacion(@PathVariable UUID id, @Valid @RequestBody ActualizarInvitacionRequest request) {
        return eventoService.actualizarInvitacion(id, request);
    }

    @GetMapping("/eventos/publico/{enlacePublico}")
    public InvitacionEventoResponse obtenerPorEnlacePublico(@PathVariable String enlacePublico) {
        return eventoService.obtenerPorEnlacePublico(enlacePublico);
    }

    @GetMapping("/usuarios/{usuarioId}/eventos")
    public List<EventoResponse> listarPorUsuario(@PathVariable UUID usuarioId) {
        return eventoService.listarPorUsuario(usuarioId);
    }

    @DeleteMapping("/eventos/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        eventoService.eliminar(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
