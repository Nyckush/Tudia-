package com.iunex.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitados")
public class Invitado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "evento_id", nullable = false)
    private Evento evento;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(nullable = false, unique = true, length = 30)
    private String telefono;

    @Column(name = "token_acceso", nullable = false, unique = true, length = 100)
    private String tokenAcceso;

    @Column(name = "estado_confirmacion", nullable = false, length = 20)
    private String estadoConfirmacion;

    @Column(name = "acompanantes_permitidos", nullable = false)
    private Integer acompanantesPermitidos = 0;

    @Column(name = "acompanantes_confirmados", nullable = false)
    private Integer acompanantesConfirmados = 0;

    @Column(columnDefinition = "TEXT")
    private String nota;

    @Column(name = "respondido_en")
    private LocalDateTime respondidoEn;

    public UUID getId() { return id; }
    public Evento getEvento() { return evento; }
    public void setEvento(Evento evento) { this.evento = evento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getTokenAcceso() { return tokenAcceso; }
    public void setTokenAcceso(String tokenAcceso) { this.tokenAcceso = tokenAcceso; }
    public String getEstadoConfirmacion() { return estadoConfirmacion; }
    public void setEstadoConfirmacion(String estadoConfirmacion) { this.estadoConfirmacion = estadoConfirmacion; }
    public Integer getAcompanantesPermitidos() { return acompanantesPermitidos; }
    public void setAcompanantesPermitidos(Integer acompanantesPermitidos) { this.acompanantesPermitidos = acompanantesPermitidos; }
    public Integer getAcompanantesConfirmados() { return acompanantesConfirmados; }
    public void setAcompanantesConfirmados(Integer acompanantesConfirmados) { this.acompanantesConfirmados = acompanantesConfirmados; }
    public String getNota() { return nota; }
    public void setNota(String nota) { this.nota = nota; }
    public LocalDateTime getRespondidoEn() { return respondidoEn; }
    public void setRespondidoEn(LocalDateTime respondidoEn) { this.respondidoEn = respondidoEn; }
}
