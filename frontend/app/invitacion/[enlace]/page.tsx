import type { Metadata } from "next";
import InvitacionClient from "./InvitacionClient";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type EventoPublico = {
  nombreCumpleanero: string;
  imagenPortadaUrl: string | null;
};

type Props = PageProps<"/invitacion/[enlace]">;

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

function urlPublica(ruta: string) {
  return new URL(ruta, APP_URL).toString();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { enlace } = await params;
  const evento = await obtenerInvitacion(enlace);

  if (!evento) return { title: "Invitación" };

  const titulo = `Invitación de ${evento.nombreCumpleanero}`;
  const imagen = evento.imagenPortadaUrl
    ? urlPublica(evento.imagenPortadaUrl)
    : undefined;

  return {
    metadataBase: new URL(APP_URL),
    title: titulo,
    description: null,
    openGraph: {
      title: titulo,
      description: "",
      url: urlPublica(`/invitacion/${enlace}`),
      type: "website",
      images: imagen ? [{ url: imagen }] : [],
    },
    twitter: {
      card: imagen ? "summary_large_image" : "summary",
      title: titulo,
      description: null,
      images: imagen ? [imagen] : [],
    },
  };
}

export default function InvitacionPage() {
  return <InvitacionClient />;
}
