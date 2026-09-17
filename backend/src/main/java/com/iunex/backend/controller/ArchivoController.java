package com.iunex.backend.controller;

import com.iunex.backend.dto.archivo.ArchivoSubidoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/archivos")
public class ArchivoController {

    private static final long TAMANO_MAXIMO_BYTES = 5L * 1024 * 1024;
    private static final Map<String, String> EXTENSIONES_PERMITIDAS = Map.of(
            MediaType.IMAGE_JPEG_VALUE, "jpg",
            MediaType.IMAGE_PNG_VALUE, "png",
            "image/webp", "webp",
            MediaType.IMAGE_GIF_VALUE, "gif"
    );

    private final Path directorioSubidas;

    public ArchivoController(@Value("${app.upload.dir:uploads}") String directorioSubidas) {
        this.directorioSubidas = Path.of(directorioSubidas).toAbsolutePath().normalize();
    }

    @PostMapping(value = "/portadas", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArchivoSubidoResponse subirPortada(@RequestPart("archivo") MultipartFile archivo) {
        if (archivo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seleccioná una imagen para subir.");
        if (archivo.getSize() > TAMANO_MAXIMO_BYTES) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen no puede superar 5 MB.");

        String extension = EXTENSIONES_PERMITIDAS.get(archivo.getContentType());
        if (extension == null) throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato no permitido. Usá JPG, PNG, WEBP o GIF.");

        try {
            Path directorioPortadas = directorioSubidas.resolve("portadas");
            Files.createDirectories(directorioPortadas);
            String nombreArchivo = UUID.randomUUID() + "." + extension;
            Files.copy(archivo.getInputStream(), directorioPortadas.resolve(nombreArchivo), StandardCopyOption.REPLACE_EXISTING);
            return new ArchivoSubidoResponse("/uploads/portadas/" + nombreArchivo);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la imagen.", exception);
        }
    }

    @PostMapping(value = "/perfiles", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArchivoSubidoResponse subirFotoPerfil(@RequestPart("archivo") MultipartFile archivo) {
        if (archivo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seleccioná una imagen para subir.");
        if (archivo.getSize() > TAMANO_MAXIMO_BYTES) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "La imagen no puede superar 5 MB.");

        String extension = EXTENSIONES_PERMITIDAS.get(archivo.getContentType());
        if (extension == null) throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Formato no permitido. Usá JPG, PNG, WEBP o GIF.");

        try {
            Path directorioPerfiles = directorioSubidas.resolve("perfiles");
            Files.createDirectories(directorioPerfiles);
            String nombreArchivo = UUID.randomUUID() + "." + extension;
            Files.copy(archivo.getInputStream(), directorioPerfiles.resolve(nombreArchivo), StandardCopyOption.REPLACE_EXISTING);
            return new ArchivoSubidoResponse("/uploads/perfiles/" + nombreArchivo);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la imagen.", exception);
        }
    }
}
