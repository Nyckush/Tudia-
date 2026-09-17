package com.iunex.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "efectos_apertura")
public class EfectoApertura {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 80)
    private String clave;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuracion_base", columnDefinition = "json")
    private Map<String, Object> configuracionBase = new LinkedHashMap<>();

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "efectoAperturaPredeterminado")
    private List<PlantillaDiseno> plantillasPredeterminadas = new ArrayList<>();

    @OneToMany(mappedBy = "efectoAperturaPersonalizado")
    private List<Evento> eventosPersonalizados = new ArrayList<>();

    @PrePersist
    void asignarFechaDeCreacion() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public Map<String, Object> getConfiguracionBase() { return configuracionBase; }
    public void setConfiguracionBase(Map<String, Object> configuracionBase) { this.configuracionBase = configuracionBase; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public List<PlantillaDiseno> getPlantillasPredeterminadas() { return plantillasPredeterminadas; }
    public List<Evento> getEventosPersonalizados() { return eventosPersonalizados; }
}
