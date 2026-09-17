package com.iunex.backend.entity;

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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "plantillas_diseno")
public class PlantillaDiseno {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String nombre;

    @Column(length = 255)
    private String descripcion;

    @Column(name = "color_primario", length = 20)
    private String colorPrimario;

    @Column(name = "color_secundario", length = 20)
    private String colorSecundario;

    @Column(name = "imagen_portada_url", length = 500)
    private String imagenPortadaUrl;

    @Column(name = "tipo_animacion", length = 50)
    private String tipoAnimacion;

    @ManyToOne
    @JoinColumn(name = "efecto_fondo_predeterminado_id")
    private EfectoFondo efectoFondoPredeterminado;

    @ManyToOne
    @JoinColumn(name = "efecto_apertura_predeterminado_id")
    private EfectoApertura efectoAperturaPredeterminado;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "configuracion_base", columnDefinition = "json")
    private Map<String, Object> configuracionBase = new LinkedHashMap<>();

    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "plantillaDiseno")
    private List<Evento> eventos = new ArrayList<>();

    @PrePersist
    void asignarFechaDeCreacion() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
    }

    public UUID getId() { return id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getColorPrimario() { return colorPrimario; }
    public void setColorPrimario(String colorPrimario) { this.colorPrimario = colorPrimario; }
    public String getColorSecundario() { return colorSecundario; }
    public void setColorSecundario(String colorSecundario) { this.colorSecundario = colorSecundario; }
    public String getImagenPortadaUrl() { return imagenPortadaUrl; }
    public void setImagenPortadaUrl(String imagenPortadaUrl) { this.imagenPortadaUrl = imagenPortadaUrl; }
    public String getTipoAnimacion() { return tipoAnimacion; }
    public void setTipoAnimacion(String tipoAnimacion) { this.tipoAnimacion = tipoAnimacion; }
    public EfectoFondo getEfectoFondoPredeterminado() { return efectoFondoPredeterminado; }
    public void setEfectoFondoPredeterminado(EfectoFondo efectoFondoPredeterminado) { this.efectoFondoPredeterminado = efectoFondoPredeterminado; }
    public EfectoApertura getEfectoAperturaPredeterminado() { return efectoAperturaPredeterminado; }
    public void setEfectoAperturaPredeterminado(EfectoApertura efectoAperturaPredeterminado) { this.efectoAperturaPredeterminado = efectoAperturaPredeterminado; }
    public Map<String, Object> getConfiguracionBase() { return configuracionBase; }
    public void setConfiguracionBase(Map<String, Object> configuracionBase) { this.configuracionBase = configuracionBase; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public List<Evento> getEventos() { return eventos; }
}
