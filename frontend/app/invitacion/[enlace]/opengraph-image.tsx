import { ImageResponse } from "next/og";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const alt = "Vista previa de la invitación";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type EventoPublico = {
  nombreCumpleanero: string;
  fechaHoraEvento: string;
  nombreLugar: string;
  colorPrimario: string | null;
  colorSecundario: string | null;
  imagenPortadaUrl: string | null;
};

function urlPublica(ruta: string) {
  return new URL(ruta, APP_URL).toString();
}

async function obtenerInvitacion(enlace: string): Promise<EventoPublico | null> {
  try {
    const respuesta = await fetch(`${BACKEND_URL}/api/eventos/publico/${encodeURIComponent(enlace)}`, {
      cache: "no-store",
    });
    if (!respuesta.ok) return null;
    return respuesta.json() as Promise<EventoPublico>;
  } catch {
    return null;
  }
}

export default async function OpenGraphImage({ params }: { params: Promise<{ enlace: string }> }) {
  const { enlace } = await params;
  const evento = await obtenerInvitacion(enlace);
  const colorPrimario = evento?.colorPrimario ?? "#1E293B";
  const colorSecundario = evento?.colorSecundario ?? "#F8FAFC";
  const imagenPortada = evento?.imagenPortadaUrl ? urlPublica(evento.imagenPortadaUrl) : null;
  const fecha = evento?.fechaHoraEvento
    ? new Intl.DateTimeFormat("es-AR", { dateStyle: "full" }).format(new Date(evento.fechaHoraEvento))
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`,
          color: "white",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          overflow: "hidden",
          position: "relative",
          width: "100%",
        }}
      >
        {imagenPortada && (
          <img
            alt=""
            src={imagenPortada}
            style={{ height: "100%", objectFit: "cover", opacity: 0.42, position: "absolute", width: "100%" }}
          />
        )}
        <div style={{ alignItems: "center", display: "flex", flexDirection: "column", maxWidth: 980, padding: "60px 80px", textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 6, opacity: 0.82 }}>ESTÁS INVITADO/A</div>
          <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1.08, marginTop: 28 }}>{evento?.nombreCumpleanero ?? "Una celebración especial"}</div>
          {fecha && <div style={{ fontSize: 32, marginTop: 42 }}>{fecha}</div>}
          {evento?.nombreLugar && <div style={{ fontSize: 28, marginTop: 14, opacity: 0.9 }}>{evento.nombreLugar}</div>}
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 46, opacity: 0.8 }}>tuDía</div>
        </div>
      </div>
    ),
    size,
  );
}
