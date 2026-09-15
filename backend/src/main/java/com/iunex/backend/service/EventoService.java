package com.iunex.backend.service;

import com.iunex.backend.dto.evento.EventoRequest;
import com.iunex.backend.dto.evento.EventoResponse;
import com.iunex.backend.dto.evento.InvitacionEventoResponse;

import java.util.List;
import java.util.UUID;

public interface EventoService {

    EventoResponse crear(EventoRequest request);

    EventoResponse obtenerPorId(UUID id);

    InvitacionEventoResponse obtenerPorEnlacePublico(String enlacePublico);

    List<EventoResponse> listarPorUsuario(UUID usuarioId);

    void eliminar(UUID id);
}
