const FORMATOS_OPTIMIZABLES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const TIPO_GIF = "image/gif";
export const TAMANO_MAXIMO_ORIGINAL_BYTES = 20 * 1024 * 1024;
export const TAMANO_MAXIMO_SUBIDA_BYTES = 5 * 1024 * 1024;

export function esImagenPermitida(archivo: File) {
  return FORMATOS_OPTIMIZABLES.has(archivo.type) || archivo.type === TIPO_GIF;
}

/** Convierte imágenes estáticas a WebP y limita su tamaño antes de subirlas. */
export async function optimizarImagen(archivo: File, ladoMaximo: number): Promise<File> {
  if (archivo.type === TIPO_GIF) return archivo;

  const imagen = await cargarImagen(archivo);
  const escala = Math.min(1, ladoMaximo / Math.max(imagen.naturalWidth, imagen.naturalHeight));
  const ancho = Math.max(1, Math.round(imagen.naturalWidth * escala));
  const alto = Math.max(1, Math.round(imagen.naturalHeight * escala));
  const lienzo = document.createElement("canvas");
  lienzo.width = ancho;
  lienzo.height = alto;
  const contexto = lienzo.getContext("2d");
  if (!contexto) throw new Error("No pudimos preparar la imagen.");

  contexto.imageSmoothingEnabled = true;
  contexto.imageSmoothingQuality = "high";
  contexto.drawImage(imagen, 0, 0, ancho, alto);
  const blob = await convertirAWebp(lienzo);
  const nombre = `${archivo.name.replace(/\.[^/.]+$/, "") || "imagen"}.webp`;
  return new File([blob], nombre, { type: "image/webp", lastModified: Date.now() });
}

function cargarImagen(archivo: File): Promise<HTMLImageElement> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const imagen = new Image();
    imagen.onload = () => {
      URL.revokeObjectURL(url);
      resolver(imagen);
    };
    imagen.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No pudimos leer la imagen seleccionada."));
    };
    imagen.src = url;
  });
}

function convertirAWebp(lienzo: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolver, rechazar) => {
    lienzo.toBlob((blob) => {
      if (blob) resolver(blob);
      else rechazar(new Error("No pudimos optimizar la imagen."));
    }, "image/webp", 0.82);
  });
}
