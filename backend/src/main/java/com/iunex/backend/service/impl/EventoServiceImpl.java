package com.iunex.backend.service.impl;

import com.iunex.backend.dto.evento.EventoRequest;
import com.iunex.backend.dto.evento.ActualizarInvitacionRequest;
import com.iunex.backend.dto.evento.EventoResponse;
import com.iunex.backend.dto.evento.InvitacionEventoResponse;
import com.iunex.backend.entity.Evento;
import com.iunex.backend.entity.EfectoApertura;
import com.iunex.backend.entity.EfectoFondo;
import com.iunex.backend.entity.PlantillaDiseno;
import com.iunex.backend.entity.Usuario;
import com.iunex.backend.repository.EventoRepository;
import com.iunex.backend.repository.EfectoAperturaRepository;
import com.iunex.backend.repository.EfectoFondoRepository;
import com.iunex.backend.repository.PlantillaDisenoRepository;
import com.iunex.backend.repository.UsuarioRepository;
import com.iunex.backend.service.EventoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class EventoServiceImpl implements EventoService {

    private final EventoRepository eventoRepository;
    private final PlantillaDisenoRepository plantillaDisenoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EfectoFondoRepository efectoFondoRepository;
    private final EfectoAperturaRepository efectoAperturaRepository;

    public EventoServiceImpl(EventoRepository eventoRepository, PlantillaDisenoRepository plantillaDisenoRepository, UsuarioRepository usuarioRepository, EfectoFondoRepository efectoFondoRepository, EfectoAperturaRepository efectoAperturaRepository) {
        this.eventoRepository = eventoRepository;
        this.plantillaDisenoRepository = plantillaDisenoRepository;
        this.usuarioRepository = usuarioRepository;
        this.efectoFondoRepository = efectoFondoRepository;
        this.efectoAperturaRepository = efectoAperturaRepository;
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
    public EventoResponse actualizarInvitacion(UUID id, ActualizarInvitacionRequest request) {
        Evento evento = buscarEntidad(id);
        if (!evento.getUsuario().getId().equals(request.usuarioId())) {
            throw new IllegalArgumentException("No podés editar la invitación de otro usuario.");
        }
        evento.setConfiguracionDiseno(new LinkedHashMap<>(request.configuracionDiseno()));
        evento.setEfectoFondoPersonalizado(request.efectoFondoId() == null ? null : buscarEfectoFondo(request.efectoFondoId()));
        evento.setEfectoAperturaPersonalizado(request.efectoAperturaId() == null ? null : buscarEfectoApertura(request.efectoAperturaId()));
        return aResponse(eventoRepository.save(evento));
    }

    @Override
    @Transactional(readOnly = true)
    public InvitacionEventoResponse obtenerPorEnlacePublico(String enlacePublico) {
        Evento evento = eventoRepository.findByEnlacePublico(enlacePublico)
                .orElseThrow(() -> new EntityNotFoundException("Invitación no encontrada."));
        PlantillaDiseno plantilla = evento.getPlantillaDiseno();
        LinkedHashMap<String, Object> configuracionDiseno = new LinkedHashMap<>();
        if (plantilla != null && plantilla.getConfiguracionBase() != null) {
            configuracionDiseno.putAll(plantilla.getConfiguracionBase());
        }
        if (evento.getConfiguracionDiseno() != null) {
            configuracionDiseno.putAll(evento.getConfiguracionDiseno());
        }

        return new InvitacionEventoResponse(
                evento.getNombreCumpleanero(), evento.getFechaHoraEvento(), evento.getNombreLugar(),
                evento.getDireccion(), evento.getLatitud(), evento.getLongitud(),
                plantilla == null ? null : plantilla.getId(),
                plantilla == null ? null : plantilla.getNombre(),
                valorConfiguracion(configuracionDiseno, "colorPrimario", plantilla == null ? null : plantilla.getColorPrimario()),
                valorConfiguracion(configuracionDiseno, "colorSecundario", plantilla == null ? null : plantilla.getColorSecundario()),
                valorConfiguracion(configuracionDiseno, "imagenPortadaUrl", plantilla == null ? null : plantilla.getImagenPortadaUrl()),
                plantilla == null ? null : plantilla.getTipoAnimacion(),
                efectoFondoEfectivo(evento) == null ? null : efectoFondoEfectivo(evento).getClave(),
                efectoAperturaEfectivo(evento) == null ? null : efectoAperturaEfectivo(evento).getClave(),
                configuracionDiseno
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
        evento.setPlantillaDiseno(request.plantillaDisenoId() == null ? null : buscarPlantillaDiseno(request.plantillaDisenoId()));
        evento.setConfiguracionDiseno(request.configuracionDiseno() == null
                ? new LinkedHashMap<>()
                : new LinkedHashMap<>(request.configuracionDiseno()));
    }

    private Usuario buscarUsuario(UUID id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado."));
    }

    private PlantillaDiseno buscarPlantillaDiseno(UUID id) {
        return plantillaDisenoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Plantilla de diseño no encontrada."));
    }

    private Evento buscarEntidad(UUID id) {
        return eventoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Evento no encontrado."));
    }

    private EfectoFondo buscarEfectoFondo(UUID id) {
        EfectoFondo efecto = efectoFondoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Efecto de fondo no encontrado."));
        if (!efecto.isActivo()) throw new IllegalArgumentException("El efecto de fondo seleccionado no está disponible.");
        return efecto;
    }

    private EfectoApertura buscarEfectoApertura(UUID id) {
        EfectoApertura efecto = efectoAperturaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Efecto de apertura no encontrado."));
        if (!efecto.isActivo()) throw new IllegalArgumentException("El efecto de apertura seleccionado no está disponible.");
        return efecto;
    }

    private EfectoFondo efectoFondoEfectivo(Evento evento) {
        if (evento.getEfectoFondoPersonalizado() != null) return evento.getEfectoFondoPersonalizado();
        return evento.getPlantillaDiseno() == null ? null : evento.getPlantillaDiseno().getEfectoFondoPredeterminado();
    }

    private EfectoApertura efectoAperturaEfectivo(Evento evento) {
        if (evento.getEfectoAperturaPersonalizado() != null) return evento.getEfectoAperturaPersonalizado();
        return evento.getPlantillaDiseno() == null ? null : evento.getPlantillaDiseno().getEfectoAperturaPredeterminado();
    }

    private EventoResponse aResponse(Evento evento) {
        return new EventoResponse(
                evento.getId(), evento.getUsuario().getId(), evento.getNombreCumpleanero(),
                evento.getFechaNacimiento(), evento.getFechaHoraEvento(), evento.getNombreLugar(),
                evento.getDireccion(), evento.getLatitud(), evento.getLongitud(), evento.getEnlacePublico(), evento.getEstado(),
                evento.getInvitados().size(),
                evento.getPlantillaDiseno() == null ? null : evento.getPlantillaDiseno().getId(),
                evento.getEfectoFondoPersonalizado() == null ? null : evento.getEfectoFondoPersonalizado().getId(),
                evento.getEfectoAperturaPersonalizado() == null ? null : evento.getEfectoAperturaPersonalizado().getId(),
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

    private String valorConfiguracion(Map<String, Object> configuracion, String clave, String valorPredeterminado) {
        Object valor = configuracion.get(clave);
        return valor instanceof String texto && !texto.isBlank() ? texto : valorPredeterminado;
    }
}
