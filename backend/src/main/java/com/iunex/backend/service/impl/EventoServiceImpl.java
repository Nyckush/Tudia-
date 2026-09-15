package com.iunex.backend.service.impl;

import com.iunex.backend.dto.evento.EventoRequest;
import com.iunex.backend.dto.evento.EventoResponse;
import com.iunex.backend.dto.evento.InvitacionEventoResponse;
import com.iunex.backend.entity.Evento;
import com.iunex.backend.entity.Usuario;
import com.iunex.backend.repository.EventoRepository;
import com.iunex.backend.repository.UsuarioRepository;
import com.iunex.backend.service.EventoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class EventoServiceImpl implements EventoService {

    private final EventoRepository eventoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventoServiceImpl(EventoRepository eventoRepository, UsuarioRepository usuarioRepository) {
        this.eventoRepository = eventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public EventoResponse crear(EventoRequest request) {
        Evento evento = new Evento();
        evento.setUsuario(buscarUsuario(request.usuarioId()));
        completarEvento(evento, request);
        evento.setEnlacePublico(generarEnlacePublico());
        return aResponse(eventoRepository.save(evento));
    }

    @Override
    @Transactional(readOnly = true)
    public EventoResponse obtenerPorId(UUID id) {
        return aResponse(buscarEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public InvitacionEventoResponse obtenerPorEnlacePublico(String enlacePublico) {
        Evento evento = eventoRepository.findByEnlacePublico(enlacePublico)
                .orElseThrow(() -> new EntityNotFoundException("Invitación no encontrada."));
        return new InvitacionEventoResponse(
                evento.getNombreCumpleanero(), evento.getFechaHoraEvento(), evento.getNombreLugar(),
                evento.getDireccion(), evento.getLatitud(), evento.getLongitud()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventoResponse> listarPorUsuario(UUID usuarioId) {
        return eventoRepository.findAllByUsuarioId(usuarioId).stream().map(this::aResponse).toList();
    }

    @Override
    public void eliminar(UUID id) {
        eventoRepository.delete(buscarEntidad(id));
    }

    private void completarEvento(Evento evento, EventoRequest request) {
        evento.setNombreCumpleanero(request.nombreCumpleanero().trim());
        evento.setFechaNacimiento(request.fechaNacimiento());
        evento.setFechaHoraEvento(request.fechaHoraEvento());
        evento.setNombreLugar(request.nombreLugar().trim());
        evento.setDireccion(request.direccion().trim());
        evento.setLatitud(request.latitud());
        evento.setLongitud(request.longitud());
        evento.setEstado(request.estado().trim());
        evento.setConfiguracionDiseno(request.configuracionDiseno() == null
                ? new LinkedHashMap<>()
                : new LinkedHashMap<>(request.configuracionDiseno()));
    }

    private Usuario buscarUsuario(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado."));
    }

    private Evento buscarEntidad(UUID id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado."));
    }

    private EventoResponse aResponse(Evento evento) {
        return new EventoResponse(
                evento.getId(), evento.getUsuario().getId(), evento.getNombreCumpleanero(),
                evento.getFechaNacimiento(), evento.getFechaHoraEvento(), evento.getNombreLugar(),
                evento.getDireccion(), evento.getLatitud(), evento.getLongitud(), evento.getEnlacePublico(), evento.getEstado(),
                evento.getConfiguracionDiseno(), evento.getCreadoEn()
        );
    }

    private String generarEnlacePublico() {
        String enlace;
        do {
            enlace = UUID.randomUUID().toString().replace("-", "");
        } while (eventoRepository.existsByEnlacePublico(enlace));
        return enlace;
    }
}
