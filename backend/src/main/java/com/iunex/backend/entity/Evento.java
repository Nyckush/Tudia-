package com.iunex.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "eventos")
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "nombre_cumpleanero", nullable = false, length = 120)
    private String nombreCumpleanero;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Column(name = "fecha_hora_evento", nullable = false)
    private LocalDateTime fechaHoraEvento;

    @Column(name = "nombre_lugar", nullable = false, length = 160)
    private String nombreLugar;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(name = "enlace_publico", nullable = false, unique = true, length = 100)
    private String enlacePublico;

    @Column(nullable = false, length = 20)
    private String estado;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuracion_diseno", columnDefinition = "json")
    private Map<String, Object> configuracionDiseno = new LinkedHashMap<>();

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "evento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Invitado> invitados = new ArrayList<>();

    @PrePersist
    void asignarFechaDeCreacion() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getNombreCumpleanero() { return nombreCumpleanero; }
    public void setNombreCumpleanero(String nombreCumpleanero) { this.nombreCumpleanero = nombreCumpleanero; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    public LocalDateTime getFechaHoraEvento() { return fechaHoraEvento; }
    public void setFechaHoraEvento(LocalDateTime fechaHoraEvento) { this.fechaHoraEvento = fechaHoraEvento; }
    public String getNombreLugar() { return nombreLugar; }
    public void setNombreLugar(String nombreLugar) { this.nombreLugar = nombreLugar; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }
    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }
    public String getEnlacePublico() { return enlacePublico; }
    public void setEnlacePublico(String enlacePublico) { this.enlacePublico = enlacePublico; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public Map<String, Object> getConfiguracionDiseno() { return configuracionDiseno; }
    public void setConfiguracionDiseno(Map<String, Object> configuracionDiseno) { this.configuracionDiseno = configuracionDiseno; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public List<Invitado> getInvitados() { return invitados; }
}
