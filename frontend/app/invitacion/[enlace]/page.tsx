"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = "/api/backend";

type EventoPublico = {
  nombreCumpleanero: string;
  fechaHoraEvento: string;
  nombreLugar: string;
  direccion: string;
  latitud: number;
  longitud: number;
};

export default function InvitacionPage() {
  const { enlace } = useParams<{ enlace: string }>();
  const [evento, setEvento] = useState<EventoPublico | null>(null);
  const [asiste, setAsiste] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/publico/${enlace}`)
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error();
        return (await respuesta.json()) as EventoPublico;
      })
      .then(setEvento)
      .catch(() => setError("No encontramos esta invitación. Pedile al organizador el enlace del evento."));
  }, [enlace]);

  async function confirmarAsistencia(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formularioHtml = event.currentTarget;
    setError("");
    setMensaje("");
    setEnviando(true);
    const formulario = new FormData(formularioHtml);

    try {
      const respuesta = await fetch(`${API_URL}/api/eventos/publico/${enlace}/confirmaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: String(formulario.get("nombre")),
          telefono: String(formulario.get("telefono")),
          asiste,
          acompanantesConfirmados: asiste ? Number(formulario.get("acompanantesConfirmados")) : 0,
          nota: String(formulario.get("nota")) || null,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { mensaje?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.mensaje ?? "No pudimos guardar tu respuesta.");
        return;
      }

      formularioHtml.reset();
      setAsiste(true);
      setMensaje(asiste ? "¡Gracias! Tu asistencia quedó confirmada." : "Tu respuesta fue registrada.");
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  if (error && !evento) return <main className="p-6 text-center text-slate-700">{error}</main>;
  if (!evento) return <main className="p-6 text-center text-slate-600">Cargando invitación...</main>;

  const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date(evento.fechaHoraEvento));
  const mapa = `https://www.google.com/maps/search/?api=1&query=${evento.latitud},${evento.longitud}`;

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Estás invitado/a</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Cumpleaños de {evento.nombreCumpleanero}</h1>
          <dl className="mt-6 space-y-4 text-slate-700">
            <div><dt className="text-sm text-slate-500">Cuándo</dt><dd>{fecha}</dd></div>
            <div><dt className="text-sm text-slate-500">Dónde</dt><dd>{evento.nombreLugar}</dd><dd className="text-sm">{evento.direccion}</dd></div>
          </dl>
          <a href={mapa} target="_blank" rel="noreferrer" className="mt-6 inline-block rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">Ver ubicación en Google Maps</a>
        </section>

        <form onSubmit={confirmarAsistencia} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Confirmá tu asistencia</h2>
          <p className="mt-1 text-sm text-slate-600">Dejá tus datos para que el organizador pueda preparar el evento.</p>

          <Campo nombre="nombre" etiqueta="Nombre" requerido />
          <Campo nombre="telefono" etiqueta="Teléfono" tipo="tel" requerido />

          <fieldset className="mt-4">
            <legend className="text-sm font-medium text-slate-800">¿Vas a asistir?</legend>
            <label className="mt-2 mr-4 inline-flex items-center gap-2"><input type="radio" checked={asiste} onChange={() => setAsiste(true)} /> Sí, asistiré</label>
            <label className="inline-flex items-center gap-2"><input type="radio" checked={!asiste} onChange={() => setAsiste(false)} /> No podré asistir</label>
          </fieldset>

          {asiste && <Campo nombre="acompanantesConfirmados" etiqueta="Acompañantes" tipo="number" valorInicial="0" requerido minimo={0} />}

          <label htmlFor="nota" className="mt-4 block text-sm font-medium text-slate-800">Nota para el organizador</label>
          <textarea id="nota" name="nota" className="mt-1 min-h-20 w-full rounded border border-slate-300 px-3 py-2" />

          {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
          {mensaje && <p className="mt-4 text-sm text-green-700">{mensaje}</p>}
          <button type="submit" disabled={enviando} className="mt-5 w-full rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60">{enviando ? "Guardando..." : "Enviar respuesta"}</button>
        </form>
      </div>
    </main>
  );
}

function Campo({ nombre, etiqueta, tipo = "text", valorInicial, requerido = false, minimo }: { nombre: string; etiqueta: string; tipo?: string; valorInicial?: string; requerido?: boolean; minimo?: number }) {
  return (
    <div className="mt-4">
      <label htmlFor={nombre} className="block text-sm font-medium text-slate-800">{etiqueta}</label>
      <input id={nombre} name={nombre} type={tipo} defaultValue={valorInicial} required={requerido} min={minimo} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
    </div>
  );
}
