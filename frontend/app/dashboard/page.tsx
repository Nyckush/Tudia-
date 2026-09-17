"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Copy, MapPin, Menu, Palette, Trash2, Users } from "lucide-react";
import { NavbarPrivado } from "../components/NavbarPrivado";

const API_URL = "/api/backend";

type Usuario = { id: string; nombre: string; correo: string; username: string };
type Evento = { id: string; nombreCumpleanero: string; fechaHoraEvento: string; nombreLugar: string; estado: string; enlacePublico: string; cantidadInvitados: number };

export default function DashboardPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [error, setError] = useState("");
  const [enlaceCopiado, setEnlaceCopiado] = useState("");
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [eventoEliminando, setEventoEliminando] = useState<string | null>(null);

  useEffect(() => {
    const sesion = localStorage.getItem("tudia.usuario");
    if (!sesion) {
      router.replace("/login");
      return;
    }

    try {
      const usuarioActual = JSON.parse(sesion) as Usuario;
      queueMicrotask(() => setUsuario(usuarioActual));
      fetch(`${API_URL}/api/usuarios/${usuarioActual.id}/eventos`)
        .then(async (respuesta) => {
          if (!respuesta.ok) throw new Error();
          return (await respuesta.json()) as Evento[];
        })
        .then(setEventos)
        .catch(() => setError("No se pudieron cargar tus eventos."))
        .finally(() => setCargandoEventos(false));
    } catch {
      localStorage.removeItem("tudia.usuario");
      router.replace("/login");
    }
  }, [router]);

  async function copiarEnlaceEvento(enlacePublico: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/invitacion/${enlacePublico}`);
      setEnlaceCopiado(enlacePublico);
    } catch {
      setError("No se pudo copiar el enlace de invitación.");
    }
  }

  async function eliminarEvento(evento: Evento) {
    const confirmado = window.confirm(`¿Eliminar el evento de ${evento.nombreCumpleanero}? Esta acción no se puede deshacer.`);
    if (!confirmado) return;

    setError("");
    setEventoEliminando(evento.id);

    try {
      const respuesta = await fetch(`${API_URL}/api/eventos/${evento.id}`, { method: "DELETE" });
      if (!respuesta.ok) throw new Error();

      setEventos((eventosActuales) => eventosActuales.filter(({ id }) => id !== evento.id));
      setMenuAbierto(null);
    } catch {
      setError("No se pudo eliminar el evento. Intentá nuevamente.");
    } finally {
      setEventoEliminando(null);
    }
  }

  if (!usuario) return <main className="p-6 text-slate-600">Cargando sesión...</main>;

  return (
    <NavbarPrivado>
    <main className="p-4 sm:p-8">
      <div className="mx-auto w-full sm:w-4/5">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <p className="text-sm text-slate-500">tuDía</p>
            <h1 className="text-2xl font-semibold text-slate-900">Hola, {usuario.nombre}</h1>
            <p className="mt-1 text-sm text-slate-600">@{usuario.username}</p>
          </div>
          <Link href="/eventos/nuevo" className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white">Crear evento</Link>
        </header>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">Mis eventos</h2>
          <p className="mt-1 text-sm text-slate-600">Acá vas a encontrar los eventos que organizás.</p>
          {cargandoEventos && <p className="mt-5 text-sm text-slate-600">Cargando eventos...</p>}
          {error && <p className="mt-5 text-sm text-red-700">{error}</p>}
          {!cargandoEventos && !error && eventos.length === 0 && <p className="mt-5 rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">Todavía no creaste eventos.</p>}
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventos.map((evento) => {
              const fechaEvento = new Date(evento.fechaHoraEvento);
              const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(fechaEvento);
              const hora = new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(fechaEvento);
              return (
              <li key={evento.id} className="relative flex min-h-72 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{evento.estado}</p>
                  <h3 className="mt-2 text-lg font-semibold text-slate-900">Cumpleaños de {evento.nombreCumpleanero}</h3>
                  <div className="mt-3 space-y-1.5 text-sm leading-6 text-slate-600"><p className="flex items-center gap-2"><CalendarDays size={16} className="text-slate-500" />{fecha}</p><p className="flex items-center gap-2"><Clock3 size={16} className="text-slate-500" />{hora} hs</p></div>
                  <p className="mt-1.5 flex items-center gap-2 text-sm leading-6 text-slate-600"><MapPin size={16} className="shrink-0 text-slate-500" />{evento.nombreLugar}</p>
                  </div>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setMenuAbierto((idActual) => idActual === evento.id ? null : evento.id)}
                      className="rounded p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      aria-label={`Opciones del evento de ${evento.nombreCumpleanero}`}
                      aria-expanded={menuAbierto === evento.id}
                      aria-controls={`menu-evento-${evento.id}`}
                    >
                      <Menu size={20} />
                    </button>
                    {menuAbierto === evento.id && (
                      <div id={`menu-evento-${evento.id}`} className="absolute right-0 z-10 mt-1 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => eliminarEvento(evento)}
                          disabled={eventoEliminando === evento.id}
                          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 size={16} />
                          {eventoEliminando === evento.id ? "Eliminando..." : "Eliminar evento"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-5">
                  <Link href={`/eventos/${evento.id}/invitados`} className="relative inline-flex flex-col items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" title="Ver invitados">
                    <Users size={18} strokeWidth={1.8} />
                    Invitados
                    {evento.cantidadInvitados > 0 && <span className="absolute -right-1 -top-1 grid min-w-5 size-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">{evento.cantidadInvitados > 99 ? "99+" : evento.cantidadInvitados}</span>}
                  </Link>
                  <Link href={`/eventos/${evento.id}/invitacion`} className="inline-flex flex-col items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" title="Editar invitación">
                    <Palette size={18} strokeWidth={1.8} />
                    Invitación
                  </Link>
                  <button onClick={() => copiarEnlaceEvento(evento.enlacePublico)} className="inline-flex flex-col items-center gap-1 rounded px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100" title="Copiar enlace">
                    <Copy size={18} strokeWidth={1.8} />
                    {enlaceCopiado === evento.enlacePublico ? "Copiado" : "Enlace"}
                  </button>
                </div>
              </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
    </NavbarPrivado>
  );
}
