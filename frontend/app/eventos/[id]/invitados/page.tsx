"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { NavbarPrivado } from "../../../components/NavbarPrivado";

const API_URL = "/api/backend";

type Invitado = {
  id: string;
  nombre: string;
  telefono: string | null;
  estadoConfirmacion: string;
  acompanantesConfirmados: number;
};

export default function InvitadosPage() {
  const router = useRouter();
  const { id: eventoId } = useParams<{ id: string }>();
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const cargarInvitados = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/eventos/${eventoId}/invitados`);
      if (!respuesta.ok) throw new Error();
      setInvitados((await respuesta.json()) as Invitado[]);
    } catch {
      setError("No se pudieron cargar los invitados.");
    }
  }, [eventoId]);

  useEffect(() => {
    if (!localStorage.getItem("tudia.usuario")) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => void cargarInvitados());
  }, [cargarInvitados, router]);

  async function agregarInvitado(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);
    const formulario = new FormData(event.currentTarget);

    try {
      const respuesta = await fetch(`${API_URL}/api/invitados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventoId,
          nombre: String(formulario.get("nombre")),
          telefono: String(formulario.get("telefono")),
          estadoConfirmacion: "PENDIENTE",
          acompanantesPermitidos: Number(formulario.get("acompanantesPermitidos")),
          acompanantesConfirmados: 0,
          nota: null,
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { mensaje?: string } | null;
      if (!respuesta.ok) {
        setError(cuerpo?.mensaje ?? "No se pudo agregar el invitado.");
        return;
      }
      event.currentTarget.reset();
      await cargarInvitados();
      setMostrarFormulario(false);
    } catch {
      setError("No se pudo conectar con el backend.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <NavbarPrivado>
    <main className="p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Confirmaciones</h1>
            <p className="mt-1 text-sm text-slate-600">Personas que respondieron a la invitación pública del evento.</p>
          </div>
          <button onClick={() => setMostrarFormulario((visible) => !visible)} className="shrink-0 rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">
            {mostrarFormulario ? "Cancelar" : "Agregar invitado"}
          </button>
        </div>

        {mostrarFormulario && (
          <form onSubmit={agregarInvitado} className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
            <Campo nombre="nombre" etiqueta="Nombre" requerido />
            <Campo nombre="telefono" etiqueta="Teléfono" tipo="tel" requerido />
            <Campo nombre="acompanantesPermitidos" etiqueta="Acompañantes permitidos" tipo="number" valorInicial="0" requerido />
            {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
            <button type="submit" disabled={enviando} className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60 sm:col-span-2">
              {enviando ? "Agregando..." : "Guardar invitado"}
            </button>
          </form>
        )}

        {error && !mostrarFormulario && <p className="mt-6 text-sm text-red-700">{error}</p>}

        <section className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Asistencia confirmada ({invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").length})</h2>
          {invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").length === 0 && <p className="mt-3 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">Todavía no hay asistencias confirmadas.</p>}
          <ul className="mt-3 space-y-3">
          {invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").map((invitado) => (
            <li key={invitado.id} className="rounded border border-slate-200 bg-white p-4">
              <p className="font-medium text-slate-900">{invitado.nombre}</p>
              <p className="mt-1 text-sm text-slate-600">{invitado.telefono ?? "Sin teléfono"} · {invitado.acompanantesConfirmados} acompañantes</p>
            </li>
          ))}
          </ul>
        </section>

        {invitados.some((invitado) => invitado.estadoConfirmacion !== "CONFIRMADO") && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">Otras respuestas</h2>
            <ul className="mt-3 space-y-3">
              {invitados.filter((invitado) => invitado.estadoConfirmacion !== "CONFIRMADO").map((invitado) => (
                <li key={invitado.id} className="rounded border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-900">{invitado.nombre}</p>
                  <p className="mt-1 text-sm text-slate-600">{invitado.telefono ?? "Sin teléfono"} · {invitado.estadoConfirmacion}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
    </NavbarPrivado>
  );
}

function Campo({ nombre, etiqueta, tipo = "text", requerido = false, valorInicial }: { nombre: string; etiqueta: string; tipo?: string; requerido?: boolean; valorInicial?: string }) {
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-slate-800">{etiqueta}</label>
      <input id={nombre} name={nombre} type={tipo} required={requerido} defaultValue={valorInicial} min={tipo === "number" ? 0 : undefined} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
    </div>
  );
}
