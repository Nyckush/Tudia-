package com.iunex.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class RecursosEstaticosConfig implements WebMvcConfigurer {

    private final String ubicacionSubidas;

    public RecursosEstaticosConfig(@Value("${app.upload.dir:uploads}") String directorioSubidas) {
        this.ubicacionSubidas = Path.of(directorioSubidas).toAbsolutePath().normalize().toUri().toString() + "/";
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(ubicacionSubidas);
    }
}
