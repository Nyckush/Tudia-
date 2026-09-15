package com.iunex.backend.controller;

import com.iunex.backend.dto.invitado.ConfirmacionPublicaRequest;
import com.iunex.backend.dto.invitado.ConfirmacionPublicaResponse;
import com.iunex.backend.service.InvitadoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/eventos/publico")
public class ConfirmacionPublicaController {

    private final InvitadoService invitadoService;

    public ConfirmacionPublicaController(InvitadoService invitadoService) {
        this.invitadoService = invitadoService;
    }

    @PostMapping("/{enlacePublico}/confirmaciones")
    public ConfirmacionPublicaResponse registrar(
            @PathVariable String enlacePublico,
            @Valid @RequestBody ConfirmacionPublicaRequest request
    ) {
        return invitadoService.registrarConfirmacionPublica(enlacePublico, request);
    }
}
