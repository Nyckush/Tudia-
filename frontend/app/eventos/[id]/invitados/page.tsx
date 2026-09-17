"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { useParams, useRouter } from "next/navigation";
import { NavbarPrivado } from "../../../components/NavbarPrivado";

const API_URL = "/api/backend";

type Invitado = {
  id: string;
  nombre: string;
  telefono: string | null;
  estadoConfirmacion: string;
  acompanantesConfirmados: number;
  nota: string | null;
};
type Evento = { nombreCumpleanero: string; fechaHoraEvento: string };

export default function InvitadosPage() {
  const router = useRouter();
  const { id: eventoId } = useParams<{ id: string }>();
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nombreEvento, setNombreEvento] = useState("");
  const [fechaEvento, setFechaEvento] = useState("");
  const [invitadoSeleccionado, setInvitadoSeleccionado] = useState<Invitado | null>(null);

  const cargarInvitados = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/eventos/${eventoId}/invitados`);
      if (!respuesta.ok) throw new Error();
      setInvitados((await respuesta.json()) as Invitado[]);
    } catch {
      setError("No se pudieron cargar los invitados.");
    }
  }, [eventoId]);

  const cargarEvento = useCallback(async () => {
    try {
      const respuesta = await fetch(`${API_URL}/api/eventos/${eventoId}`);
      if (!respuesta.ok) throw new Error();
      const evento = (await respuesta.json()) as Evento;
      setNombreEvento(evento.nombreCumpleanero);
      setFechaEvento(evento.fechaHoraEvento);
    } catch {
      setNombreEvento("");
      setFechaEvento("");
    }
  }, [eventoId]);

  useEffect(() => {
    if (!localStorage.getItem("tudia.usuario")) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => { void cargarInvitados(); void cargarEvento(); });
  }, [cargarEvento, cargarInvitados, router]);

  function descargarConfirmados() {
    const confirmados = invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO");
    if (confirmados.length === 0) return;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const margen = 18;
    const ancho = 210 - margen * 2;
    const columnas = { numero: margen, nombre: margen + 15, celular: margen + 111 };
    const separadoresColumnas = [columnas.nombre, columnas.celular];
    const limitesColumnas = [margen, ...separadoresColumnas, margen + ancho];
    const centrosColumnas = { numero: (margen + columnas.nombre) / 2, nombre: (columnas.nombre + columnas.celular) / 2, celular: (columnas.celular + margen + ancho) / 2 };
    const fechaFormateada = fechaEvento ? new Intl.DateTimeFormat("es-AR", { dateStyle: "full", timeStyle: "short" }).format(new Date(fechaEvento)) : "No disponible";
    let y = 23;
    const encabezado = () => {
      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.35);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.line(margen, y, margen + ancho, y);
      pdf.line(margen, y + 10, margen + ancho, y + 10);
      limitesColumnas.forEach((x) => pdf.line(x, y, x, y + 10));
      pdf.setLineDashPattern([], 0);
      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("N°", centrosColumnas.numero, y + 6.4, { align: "center" });
      pdf.text("NOMBRE COMPLETO", centrosColumnas.nombre, y + 6.4, { align: "center" });
      pdf.text("CELULAR", centrosColumnas.celular, y + 6.4, { align: "center" });
      pdf.setTextColor(31, 41, 55);
      y += 15;
    };
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(15, 23, 42);
    pdf.text("Lista de Invitados", 105, y, { align: "center" });
    y += 9;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(71, 85, 105);
    pdf.text(`Cumpleañero: ${nombreEvento || "No disponible"}`, 105, y, { align: "center" });
    y += 6;
    pdf.text(`Fecha del evento: ${fechaFormateada}`, 105, y, { align: "center" });
    y += 6;
    pdf.text(`Asistencias confirmadas: ${confirmados.length}`, 105, y, { align: "center" });
    y += 10;
    encabezado();
    confirmados.forEach((invitado, indice) => {
      const nombre = pdf.splitTextToSize(invitado.nombre, 88) as string[];
      const celular = pdf.splitTextToSize(invitado.telefono ?? "Sin celular", 48) as string[];
      const alto = Math.max(nombre.length, celular.length) * 6 + 7;
      if (y + alto > 278) { pdf.addPage(); y = 20; encabezado(); }
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.25);
      pdf.setLineDashPattern([1, 1], 0);
      pdf.line(margen, y, margen + ancho, y);
      pdf.line(margen, y + alto, margen + ancho, y + alto);
      limitesColumnas.forEach((x) => pdf.line(x, y, x, y + alto));
      pdf.setLineDashPattern([], 0);
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);
      pdf.text(String(indice + 1), centrosColumnas.numero, y + 5.5, { align: "center" });
      pdf.text(nombre, centrosColumnas.nombre, y + 5.5, { align: "center" });
      pdf.text(celular, centrosColumnas.celular, y + 5.5, { align: "center" });
      y += alto;
    });
    const paginas = pdf.getNumberOfPages();
    for (let pagina = 1; pagina <= paginas; pagina += 1) {
      pdf.setPage(pagina);
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`tuDía · Página ${pagina} de ${paginas}`, margen, 289);
    }
    const nombreArchivo = `invitados-${(nombreEvento || "confirmados").toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    pdf.save(nombreArchivo);
  }

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
          acompanantesPermitidos: 0,
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
            {error && <p className="text-sm text-red-700 sm:col-span-2">{error}</p>}
            <button type="submit" disabled={enviando} className="rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60 sm:col-span-2">
              {enviando ? "Agregando..." : "Guardar invitado"}
            </button>
          </form>
        )}

        {error && !mostrarFormulario && <p className="mt-6 text-sm text-red-700">{error}</p>}

        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">Asistencia confirmada ({invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").length})</h2><button type="button" onClick={descargarConfirmados} disabled={invitados.every((invitado) => invitado.estadoConfirmacion !== "CONFIRMADO")} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><Download size={17} /> Descargar PDF</button></div>
          {invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").length === 0 && <p className="mt-3 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">Todavía no hay asistencias confirmadas.</p>}
          <ul className="mt-3 space-y-3">
          {invitados.filter((invitado) => invitado.estadoConfirmacion === "CONFIRMADO").map((invitado) => (
            <li key={invitado.id} onClick={() => setInvitadoSeleccionado(invitado)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setInvitadoSeleccionado(invitado); }} role="button" tabIndex={0} className="cursor-pointer rounded border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400">
              <p className="font-medium text-slate-900">{invitado.nombre}</p>
              <p className="mt-1 text-sm text-slate-600">{invitado.telefono ?? "Sin teléfono"}</p>
              {invitado.nota && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"><span className="font-medium">Nota:</span> {resumenNota(invitado.nota)}</p>}
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
                  {invitado.nota && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"><span className="font-medium">Nota para el organizador:</span> {invitado.nota}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {invitadoSeleccionado && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="titulo-detalle-invitado" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Asistencia confirmada</p><h2 id="titulo-detalle-invitado" className="mt-1 text-xl font-semibold text-slate-900">{invitadoSeleccionado.nombre}</h2></div><button type="button" onClick={() => setInvitadoSeleccionado(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Cerrar detalle"><X size={20} /></button></div><div className="mt-6 space-y-4 text-sm"><div><p className="font-medium text-slate-500">Teléfono</p><p className="mt-1 text-slate-900">{invitadoSeleccionado.telefono ?? "Sin teléfono"}</p></div><div><p className="font-medium text-slate-500">Nota para el organizador</p><p className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-4 leading-6 text-slate-800">{invitadoSeleccionado.nota || "No dejó ninguna nota."}</p></div></div><button type="button" onClick={() => setInvitadoSeleccionado(null)} className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800">Cerrar</button></div></div>}
      </div>
    </main>
    </NavbarPrivado>
  );
}

function resumenNota(nota: string) {
  return nota.length > 90 ? `${nota.slice(0, 90).trimEnd()}...` : nota;
}

function Campo({ nombre, etiqueta, tipo = "text", requerido = false, valorInicial }: { nombre: string; etiqueta: string; tipo?: string; requerido?: boolean; valorInicial?: string }) {
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-slate-800">{etiqueta}</label>
      <input id={nombre} name={nombre} type={tipo} required={requerido} defaultValue={valorInicial} min={tipo === "number" ? 0 : undefined} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
    </div>
  );
}
