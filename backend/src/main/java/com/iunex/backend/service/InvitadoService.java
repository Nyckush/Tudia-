package com.iunex.backend.service;

import com.iunex.backend.dto.invitado.InvitadoRequest;
import com.iunex.backend.dto.invitado.ConfirmacionPublicaRequest;
import com.iunex.backend.dto.invitado.ConfirmacionPublicaResponse;
import com.iunex.backend.dto.invitado.InvitadoResponse;

import java.util.List;
import java.util.UUID;

public interface InvitadoService {

    InvitadoResponse crear(InvitadoRequest request);

    InvitadoResponse obtenerPorId(UUID id);

    ConfirmacionPublicaResponse registrarConfirmacionPublica(String enlacePublico, ConfirmacionPublicaRequest request);

    List<InvitadoResponse> listarPorEvento(UUID eventoId);

    void eliminar(UUID id);
}
