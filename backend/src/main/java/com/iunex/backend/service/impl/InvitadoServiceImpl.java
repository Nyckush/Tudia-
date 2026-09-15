package com.iunex.backend.service.impl;

import com.iunex.backend.dto.invitado.InvitadoRequest;
import com.iunex.backend.dto.invitado.ConfirmacionPublicaRequest;
import com.iunex.backend.dto.invitado.ConfirmacionPublicaResponse;
import com.iunex.backend.dto.invitado.InvitadoResponse;
import com.iunex.backend.entity.Evento;
import com.iunex.backend.entity.Invitado;
import com.iunex.backend.repository.EventoRepository;
import com.iunex.backend.repository.InvitadoRepository;
import com.iunex.backend.service.InvitadoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@Transactional
public class InvitadoServiceImpl implements InvitadoService {

    private final InvitadoRepository invitadoRepository;
    private final EventoRepository eventoRepository;

    public InvitadoServiceImpl(InvitadoRepository invitadoRepository, EventoRepository eventoRepository) {
        this.invitadoRepository = invitadoRepository;
        this.eventoRepository = eventoRepository;
    }

    @Override
    public InvitadoResponse crear(InvitadoRequest request) {
        if (request.acompanantesConfirmados() > request.acompanantesPermitidos()) {
            throw new IllegalArgumentException("Los acompañantes confirmados no pueden superar los permitidos.");
        }
        String telefono = normalizarTelefono(request.telefono());
        if (invitadoRepository.existsByTelefono(telefono)) {
            throw new IllegalArgumentException("Ya existe un invitado registrado con ese teléfono.");
        }

        Invitado invitado = new Invitado();
        invitado.setEvento(buscarEvento(request.eventoId()));
        invitado.setNombre(request.nombre().trim());
        invitado.setTelefono(telefono);
        invitado.setTokenAcceso(generarTokenAcceso());
        invitado.setEstadoConfirmacion(request.estadoConfirmacion().trim());
        invitado.setAcompanantesPermitidos(request.acompanantesPermitidos());
        invitado.setAcompanantesConfirmados(request.acompanantesConfirmados());
        invitado.setNota(limpiar(request.nota()));

        return aResponse(invitadoRepository.save(invitado));
    }

    @Override
    @Transactional(readOnly = true)
    public InvitadoResponse obtenerPorId(UUID id) {
        return aResponse(buscarEntidad(id));
    }

    @Override
    @Transactional
    public ConfirmacionPublicaResponse registrarConfirmacionPublica(String enlacePublico, ConfirmacionPublicaRequest request) {
        Evento evento = eventoRepository.findByEnlacePublico(enlacePublico)
                .orElseThrow(() -> new EntityNotFoundException("Invitación no encontrada."));

        int acompanantesConfirmados = request.asiste() ? request.acompanantesConfirmados() : 0;
        String telefono = normalizarTelefono(request.telefono());
        Invitado invitado = invitadoRepository.findByTelefono(telefono).orElseGet(Invitado::new);
        if (invitado.getId() != null && !invitado.getEvento().getId().equals(evento.getId())) {
            throw new IllegalArgumentException("Este teléfono ya está registrado para otro evento.");
        }

        invitado.setEvento(evento);
        invitado.setNombre(request.nombre().trim());
        invitado.setTelefono(telefono);
        invitado.setEstadoConfirmacion(request.asiste() ? "CONFIRMADO" : "RECHAZADO");
        invitado.setAcompanantesPermitidos(acompanantesConfirmados);
        invitado.setAcompanantesConfirmados(acompanantesConfirmados);
        invitado.setNota(limpiar(request.nota()));
        invitado.setRespondidoEn(LocalDateTime.now());
        if (invitado.getTokenAcceso() == null) {
            invitado.setTokenAcceso(generarTokenAcceso());
        }

        Invitado respuesta = invitadoRepository.save(invitado);
        return new ConfirmacionPublicaResponse(
                respuesta.getNombre(), respuesta.getEstadoConfirmacion(), respuesta.getAcompanantesConfirmados()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvitadoResponse> listarPorEvento(UUID eventoId) {
        return invitadoRepository.findAllByEventoId(eventoId).stream().map(this::aResponse).toList();
    }

    @Override
    public void eliminar(UUID id) {
        invitadoRepository.delete(buscarEntidad(id));
    }

    private Evento buscarEvento(UUID id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado."));
    }

    private Invitado buscarEntidad(UUID id) {
        return invitadoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invitado no encontrado."));
    }

    private InvitadoResponse aResponse(Invitado invitado) {
        return new InvitadoResponse(
                invitado.getId(), invitado.getEvento().getId(), invitado.getNombre(), invitado.getTelefono(),
                invitado.getEstadoConfirmacion(),
                invitado.getAcompanantesPermitidos(), invitado.getAcompanantesConfirmados(),
                invitado.getNota(), invitado.getRespondidoEn()
        );
    }

    private String limpiar(String valor) {
        return valor == null || valor.isBlank() ? null : valor.trim();
    }

    private String normalizarTelefono(String telefono) {
        return telefono.trim().replaceAll("[\\s()-]", "").toLowerCase(Locale.ROOT);
    }

    private String generarTokenAcceso() {
        String token;
        do {
            token = UUID.randomUUID().toString().replace("-", "");
        } while (invitadoRepository.existsByTokenAcceso(token));
        return token;
    }
}
