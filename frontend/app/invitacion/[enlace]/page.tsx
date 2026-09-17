"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { CalendarDays, CheckCircle2, MailOpen, MapPin, Users, X } from "lucide-react";
import { useParams } from "next/navigation";

const API_URL = "/api/backend";

type EventoPublico = {
  nombreCumpleanero: string;
  fechaHoraEvento: string;
  nombreLugar: string;
  direccion: string;
  latitud: number;
  longitud: number;
  nombrePlantilla: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  imagenPortadaUrl: string | null;
  tipoAnimacion: string | null;
  efectoFondoClave: string | null;
  efectoAperturaClave: string | null;
  configuracionDiseno: Record<string, unknown>;
};

export default function InvitacionPage() {
  const { enlace } = useParams<{ enlace: string }>();
  const [evento, setEvento] = useState<EventoPublico | null>(null);
  const [invitacionAbierta, setInvitacionAbierta] = useState(false);
  const [abriendoInvitacion, setAbriendoInvitacion] = useState(false);
  const [asiste, setAsiste] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [destelloFuegos, setDestelloFuegos] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const efectoPreviaEjecutado = useRef(false);

  useEffect(() => {
    fetch(`${API_URL}/api/eventos/publico/${enlace}`)
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error();
        return (await respuesta.json()) as EventoPublico;
      })
      .then(setEvento)
      .catch(() => setError("No encontramos esta invitación. Pedile al organizador el enlace del evento."));
  }, [enlace]);

  useEffect(() => {
    if (!evento || efectoPreviaEjecutado.current) return;
    const efectoApertura = evento.efectoAperturaClave ?? (typeof evento.configuracionDiseno.efectoApertura === "string" ? evento.configuracionDiseno.efectoApertura : null);

    const temporizador = window.setTimeout(() => {
      if (esFuegosArtificiales(evento.nombrePlantilla, efectoApertura)) {
        setDestelloFuegos(true);
        window.setTimeout(() => setDestelloFuegos(false), 1600);
      }
      lanzarEfectoApertura(evento.nombrePlantilla, efectoApertura, true);
      efectoPreviaEjecutado.current = true;
    }, 350);
    return () => window.clearTimeout(temporizador);
  }, [evento]);

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
          acompanantesConfirmados: 0,
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
      setModalAbierto(false);
      setMensaje(asiste ? "¡Gracias! Tu asistencia quedó confirmada." : "Tu respuesta fue registrada.");
      setModalExitoAbierto(true);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
  }

  function elegirAsistencia(valor: boolean) {
    setAsiste(valor);
    setError("");
    setMensaje("");
    setModalAbierto(true);
  }

  function abrirInvitacion() {
    if (abriendoInvitacion) return;
    setAbriendoInvitacion(true);
    window.setTimeout(() => {
      setInvitacionAbierta(true);
      if (esFuegosArtificiales(evento?.nombrePlantilla ?? null, efectoApertura)) {
        setDestelloFuegos(true);
        window.setTimeout(() => setDestelloFuegos(false), 1600);
      }
      window.setTimeout(() => lanzarEfectoApertura(evento?.nombrePlantilla ?? null, efectoApertura), 80);
    }, 280);
  }

  if (error && !evento) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-center text-slate-700">{error}</main>;
  if (!evento) return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-slate-600">Cargando invitación...</main>;

  const colorPrimario = evento.colorPrimario ?? "#1E293B";
  const colorSecundario = evento.colorSecundario ?? "#F8FAFC";
  const efectoFondo = evento.efectoFondoClave ?? (typeof evento.configuracionDiseno.efectoFondo === "string" ? evento.configuracionDiseno.efectoFondo : null);
  const efectoApertura = evento.efectoAperturaClave ?? (typeof evento.configuracionDiseno.efectoApertura === "string" ? evento.configuracionDiseno.efectoApertura : null);
  const imagenEnPantallaApertura = valorBooleano(evento.configuracionDiseno, "imagenEnPantallaApertura", true);
  const imagenEnFondoInvitacion = valorBooleano(evento.configuracionDiseno, "imagenEnFondoInvitacion", true);
  const imagenEnTarjetaPrincipal = valorBooleano(evento.configuracionDiseno, "imagenEnTarjetaPrincipal", true);
  const fechaEvento = new Date(evento.fechaHoraEvento);
  const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "full" }).format(fechaEvento);
  const hora = new Intl.DateTimeFormat("es-AR", { timeStyle: "short" }).format(fechaEvento);
  const direccionVisible = sinCoordenadas(evento.direccion);
  const mapa = `https://www.google.com/maps/search/?api=1&query=${evento.latitud},${evento.longitud}`;
  const estiloPantallaApertura = estiloDePortada(evento.imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnPantallaApertura);
  const estiloFondoInvitacion = estiloDePortada(evento.imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnFondoInvitacion);
  const estiloTarjetaPrincipal = estiloDePortada(evento.imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnTarjetaPrincipal);

  if (!invitacionAbierta) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-cover bg-center bg-fixed p-6" style={estiloPantallaApertura}>
        <FondoAnimado nombrePlantilla={evento.nombrePlantilla} efectoFondo={efectoFondo} destacado />
        {destelloFuegos && <DestellosFuegos />}
        <ConfetiPrevia />
        <section className={`relative w-full max-w-md overflow-hidden p-7 text-center transition duration-300 sm:p-10 ${abriendoInvitacion ? "scale-105 opacity-0" : "scale-100 opacity-100"}`}>
          <div className="relative z-10">
            <div className="mx-auto grid size-16 place-items-center rounded-full text-white shadow-lg" style={{ backgroundColor: colorPrimario }}><MailOpen size={28} /></div>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Tenés una invitación especial</p>
            <h1 className="mt-4 text-3xl font-semibold text-white">De {evento.nombreCumpleanero}</h1>
            <p className="mt-4 text-sm leading-6 text-white/90">Hay una celebración esperando por vos.</p>
            <button type="button" onClick={abrirInvitacion} disabled={abriendoInvitacion} className="mt-10 inline-flex items-center gap-3 rounded-2xl px-10 py-5 text-lg font-semibold text-white shadow-lg ring-2 ring-white/30 transition duration-300 hover:-translate-y-1 hover:scale-105 hover:brightness-110 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/60 disabled:opacity-70" style={{ backgroundColor: colorPrimario }}><MailOpen size={24} /> Abrir invitación</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-cover bg-center bg-fixed px-4 py-8 sm:py-12" style={estiloFondoInvitacion}>
      <FondoAnimado nombrePlantilla={evento.nombrePlantilla} efectoFondo={efectoFondo} />
      {destelloFuegos && <DestellosFuegos />}
      <div className="relative mx-auto max-w-4xl animate-[invite-reveal_550ms_ease-out]">
        <section className="relative overflow-hidden rounded-3xl bg-cover bg-center shadow-xl" style={estiloTarjetaPrincipal}>
          <FondoAnimado nombrePlantilla={evento.nombrePlantilla} efectoFondo={efectoFondo} dentroDeTarjeta />
          <div className="relative z-10 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
            <p className="text-sm font-medium tracking-[0.2em] text-white/80">ESTÁS INVITADO/A</p>
            <h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{evento.nombreCumpleanero}</h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/90 sm:text-lg">Quiero compartir este día especial con vos. ¡Te espero para festejar!</p>
            {evento.nombrePlantilla && <p className="mt-8 text-xs font-medium uppercase tracking-widest text-white/70">{evento.nombrePlantilla}</p>}
          </div>
        </section>

        <div className="grid gap-6 py-6">
          <section className="rounded-[2rem] border border-white/25 bg-white/10 p-4 shadow-[0_18px_45px_rgb(15_23_42_/_18%)] backdrop-blur-sm sm:p-6">
            <div className="flex items-center gap-3 px-1"><span className="grid size-9 place-items-center rounded-xl bg-white/20 text-white shadow-sm"><CalendarDays size={18} /></span><div><p className="text-sm font-semibold uppercase tracking-wider text-white" style={{ textShadow: "0 1px 8px rgb(0 0 0 / 30%)" }}>La celebración</p><p className="mt-0.5 text-xs text-white/75">Todo lo que necesitás para llegar y festejar</p></div></div>
            <div className="mt-5 space-y-3">
              <Detalle color={colorPrimario} icono={<CalendarDays size={20} />} titulo="Cuándo"><p className="font-semibold text-slate-900">{fecha}</p><p>{hora} hs</p></Detalle>
              <Detalle color={colorPrimario} icono={<MapPin size={20} />} titulo="Dónde"><p className="font-semibold text-slate-900">{evento.nombreLugar}</p>{direccionVisible && <p>{direccionVisible}</p>}</Detalle>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <a href={mapa} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"><MapPin size={18} className="transition group-hover:scale-110" style={{ color: colorPrimario }} /> Cómo llegar</a>
              <a href={crearEnlaceCalendario(evento)} target="_blank" rel="noreferrer" className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"><CalendarDays size={18} className="transition group-hover:scale-110" style={{ color: colorPrimario }} /> Agendar</a>
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/60 bg-white/90 p-5 shadow-[0_18px_45px_rgb(15_23_42_/_18%)] backdrop-blur sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl text-white shadow-sm" style={{ backgroundColor: colorPrimario }}><Users size={21} /></span><div><h2 className="text-xl font-semibold text-slate-900">Confirmá asistencia</h2><p className="mt-1 text-sm leading-6 text-slate-600">¿Vas a acompañarnos en este día?</p></div></div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button type="button" onClick={() => elegirAsistencia(true)} className="rounded-2xl px-3 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-md" style={{ backgroundColor: colorPrimario }}>Sí, asistiré</button>
                <button type="button" onClick={() => elegirAsistencia(false)} className="rounded-2xl border border-slate-200 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50">No podré asistir</button>
              </div>
          </section>
        </div>
        {modalAbierto && <div className="fixed inset-0 z-50 grid animate-[modal-backdrop-in_220ms_ease-out] place-items-center bg-slate-950/50 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion" className="w-full max-w-md animate-[modal-panel-in_320ms_cubic-bezier(.16,1,.3,1)] rounded-3xl bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4"><div><h2 id="titulo-confirmacion" className="text-xl font-semibold text-slate-900">{asiste ? "Confirmá tu asistencia" : "Registrá tu respuesta"}</h2><p className="mt-1 text-sm text-slate-600">{asiste ? "Completá tus datos para confirmar." : "Contanos quién no podrá asistir."}</p></div><button type="button" onClick={() => setModalAbierto(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Cerrar"><X size={20} /></button></div>
            <form onSubmit={confirmarAsistencia}>
              <Campo nombre="nombre" etiqueta="Nombre" requerido />
              <Campo nombre="telefono" etiqueta="Teléfono" tipo="tel" requerido />
              <label htmlFor="nota" className="mt-5 block text-sm font-medium text-slate-800">Nota para el organizador</label>
              <textarea id="nota" name="nota" className="mt-1 min-h-20 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-500" />
              {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={enviando} className="mt-5 w-full rounded-xl px-4 py-3 font-medium text-white shadow-sm disabled:opacity-60" style={{ backgroundColor: colorPrimario }}>{enviando ? "Guardando..." : "Enviar respuesta"}</button>
            </form>
          </div>
        </div>}
        {modalExitoAbierto && <div className="fixed inset-0 z-50 grid animate-[modal-backdrop-in_220ms_ease-out] place-items-center bg-slate-950/50 p-4" role="presentation">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-confirmacion-exitosa" className="w-full max-w-sm animate-[modal-panel-in_320ms_cubic-bezier(.16,1,.3,1)] rounded-3xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 size={30} /></div>
            <h2 id="titulo-confirmacion-exitosa" className="mt-5 text-xl font-semibold text-slate-900">¡Respuesta registrada!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{mensaje}</p>
            <button type="button" onClick={() => setModalExitoAbierto(false)} className="mt-6 w-full rounded-xl px-4 py-3 font-medium text-white shadow-sm" style={{ backgroundColor: colorPrimario }}>Entendido</button>
          </div>
        </div>}
        <p className="pb-4 text-center text-xs text-slate-500">Esta invitación fue creada con tuDía.</p>
      </div>
    </main>
  );
}

function Detalle({ icono, titulo, color, children }: { icono: React.ReactNode; titulo: string; color: string; children: React.ReactNode }) {
  return <div className="flex gap-4 rounded-2xl border border-white/70 bg-white/90 p-4 text-sm leading-6 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md sm:p-5"><span className="grid size-11 shrink-0 place-items-center rounded-2xl shadow-sm" style={{ color, backgroundColor: `${color}18` }}>{icono}</span><div className="min-w-0"><p className="mb-0.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{titulo}</p>{children}</div></div>;
}

function valorBooleano(configuracion: Record<string, unknown>, clave: string, predeterminado: boolean) {
  return typeof configuracion[clave] === "boolean" ? configuracion[clave] as boolean : predeterminado;
}

function estiloDePortada(imagenPortadaUrl: string | null, colorPrimario: string, colorSecundario: string, mostrarImagen: boolean) {
  return mostrarImagen && imagenPortadaUrl
    ? { backgroundImage: `linear-gradient(135deg, ${colorPrimario}e6, ${colorSecundario}d9), url(${imagenPortadaUrl})` }
    : { backgroundImage: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` };
}

function sinCoordenadas(direccion: string) {
  return direccion.replace(/\(?\s*-?\d{1,3}[.,]\d+\s*,\s*-?\d{1,3}[.,]\d+\s*\)?/g, "").replace(/\s{2,}/g, " ").replace(/^\s*[-,·|]\s*|\s*[-,·|]\s*$/g, "").trim();
}

function Campo({ nombre, etiqueta, tipo = "text", valorInicial, requerido = false, minimo }: { nombre: string; etiqueta: string; tipo?: string; valorInicial?: string; requerido?: boolean; minimo?: number }) {
  return <div className="mt-4"><label htmlFor={nombre} className="block text-sm font-medium text-slate-800">{etiqueta}</label><input id={nombre} name={nombre} type={tipo} defaultValue={valorInicial} required={requerido} min={minimo} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-500" /></div>;
}

function ConfetiPrevia() {
  const piezas = ["●", "▲", "■", "●", "■", "▲", "●", "■", "▲", "●", "■", "▲"];
  const colores = ["#facc15", "#fb7185", "#38bdf8", "#a78bfa", "#34d399", "#fb923c"];
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{piezas.map((pieza, indice) => <span key={`${pieza}-${indice}`} className="absolute opacity-0 animate-[preview-confetti_4.5s_ease-in-out_infinite] text-lg" style={{ left: `${5 + (indice * 17) % 90}%`, top: `${8 + (indice * 29) % 78}%`, color: colores[indice % colores.length], animationDelay: `${indice * 0.28}s` }}>{pieza}</span>)}</div>;
}

function esFuegosArtificiales(nombrePlantilla: string | null, efectoSeleccionado: string | null) {
  if (efectoSeleccionado) return efectoSeleccionado === "fuegos-artificiales";
  return (nombrePlantilla ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes("dorado");
}

function DestellosFuegos() {
  return <div aria-hidden className="pointer-events-none fixed inset-0 z-[5] overflow-hidden"><span className="firework-glow" style={{ left: "10%", top: "14%" }} /><span className="firework-glow" style={{ left: "68%", top: "8%", animationDelay: "180ms" }} /><span className="firework-glow" style={{ left: "24%", top: "34%", animationDelay: "360ms" }} /><span className="firework-glow" style={{ left: "54%", top: "34%", animationDelay: "540ms" }} /></div>;
}

function LluviaDeEstrellas({ comoFondo = false }: { comoFondo?: boolean }) {
  const posiciones = [[4, 2], [12, 28], [21, 10], [30, 42], [39, 4], [48, 24], [57, 12], [66, 38], [75, 6], [84, 30], [93, 16], [8, 54], [26, 62], [45, 48], [62, 58], [80, 52], [96, 68]];
  const posicionCapa = comoFondo ? "absolute z-0" : "fixed z-[5]";
  const claseEstrella = comoFondo ? "luminous-rain-star luminous-rain-star-background" : "luminous-rain-star";
  return <div aria-hidden className={`pointer-events-none ${posicionCapa} inset-0 overflow-hidden`}>{posiciones.map(([left, top], indice) => <span key={indice} className={claseEstrella} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${indice * 340}ms` }}>✦</span>)}</div>;
}

function FondoAnimado({ nombrePlantilla, efectoFondo, dentroDeTarjeta = false, destacado = false }: { nombrePlantilla: string | null; efectoFondo: string | null; dentroDeTarjeta?: boolean; destacado?: boolean }) {
  const plantilla = (efectoFondo ?? nombrePlantilla ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const esNocheNeon = plantilla.includes("noche neon") || plantilla.includes("estrellas-fugaces") || plantilla.includes("estrellas fugaces");
  const esLluviaEstrellas = plantilla.includes("lluvia-estrellas") || plantilla.includes("lluvia estrellas");
  const esEleganteDorado = plantilla.includes("elegante dorado") || plantilla.includes("estrellas-doradas") || plantilla.includes("estrellas doradas");
  const esMinimalista = plantilla.includes("minimalista") || plantilla.includes("puntos-de-luz") || plantilla.includes("puntos de luz");
  const posiciones = [[8, 14], [20, 45], [34, 25], [48, 68], [62, 18], [76, 50], [90, 30]];
  const posicionesEstrellasDoradas = [[5, 10], [13, 34], [22, 62], [31, 18], [40, 46], [49, 76], [57, 8], [66, 33], [74, 60], [83, 20], [91, 48], [97, 74]];
  const posicionesTarjeta = [[4, 8], [38, 24], [70, 10]];
  const posicionCapa = dentroDeTarjeta ? "absolute" : "fixed";
  const claseIntensidad = destacado ? " background-effect-intense" : "";

  if (esLluviaEstrellas) return <LluviaDeEstrellas comoFondo />;

  if (esNocheNeon) {
    const posicionesEfecto = dentroDeTarjeta ? posicionesTarjeta : posiciones;
    return <div aria-hidden className={`pointer-events-none ${posicionCapa} inset-0 z-0 overflow-hidden`}>{posicionesEfecto.map(([izquierda, arriba], indice) => <span key={`${izquierda}-${arriba}`} className={`shooting-star shooting-star-card${claseIntensidad}`} style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * 0.7}s` }} />)}</div>;
  }

  if (esEleganteDorado) {
    const coloresEstrellas = ["#fff7cc", "#fbbf24", "#ffffff", "#fde68a", "#f59e0b", "#fff7cc", "#fef3c7", "#fbbf24", "#ffffff", "#fde68a", "#f59e0b", "#fff7cc"];
    return <div aria-hidden className={`pointer-events-none ${posicionCapa} inset-0 z-0 overflow-hidden`}>{posicionesEstrellasDoradas.map(([izquierda, arriba], indice) => <span key={`${izquierda}-${arriba}`} className={`absolute opacity-0 animate-[invite-float_4s_ease-in-out_infinite] text-lg drop-shadow-[0_0_6px_rgba(251,191,36,.9)]${claseIntensidad}`} style={{ left: `${izquierda}%`, top: `${arriba}%`, color: coloresEstrellas[indice], animationDelay: `${indice * 0.28}s` }}>✦</span>)}</div>;
  }

  if (esMinimalista) {
    const coloresLuz = ["#ffffff", "#e2e8f0", "#ffffff", "#cbd5e1", "#ffffff", "#e2e8f0", "#ffffff"];
    return <div aria-hidden className={`pointer-events-none ${posicionCapa} inset-0 z-0 overflow-hidden`}>{posiciones.map(([izquierda, arriba], indice) => <span key={`${izquierda}-${arriba}`} className={`background-light absolute size-1.5 rounded-full opacity-0 shadow-[0_0_10px_2px_rgba(255,255,255,.65)] animate-[minimal-glow_4.5s_ease-in-out_infinite]${claseIntensidad}`} style={{ left: `${izquierda}%`, top: `${arriba}%`, backgroundColor: coloresLuz[indice], animationDelay: `${indice * 0.48}s` }} />)}</div>;
  }

  const coloresGlobos = ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399", "#fb923c", "#f472b6"];
  return <div aria-hidden className={`pointer-events-none ${posicionCapa} inset-0 z-0 overflow-hidden`}>{posiciones.map(([izquierda, arriba], indice) => <span key={`${izquierda}-${arriba}`} className={`background-balloon absolute opacity-0 animate-[invite-float_4s_ease-in-out_infinite]${claseIntensidad}`} style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * 0.42}s`, "--balloon-color": coloresGlobos[indice] } as React.CSSProperties} />)}</div>;
}

function lanzarEfectoApertura(nombrePlantilla: string | null, efectoSeleccionado: string | null, enPantallaPrevia = false) {
  const plantilla = (nombrePlantilla ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const efecto = efectoSeleccionado ?? (plantilla.includes("infantil") ? "globos-explosion" : plantilla.includes("dorado") ? "fuegos-artificiales" : "confeti");
  const opcionesBase = { disableForReducedMotion: false, zIndex: 100 };

  if (efecto === "globos-explosion") {
    lanzarExplosionesDeGlobos(3, enPantallaPrevia);
    return;
  }

  if (efecto === "fuegos-artificiales") {
    const fuegoArtificial = (x: number, y: number) => confetti({ ...opcionesBase, particleCount: 115, spread: 360, startVelocity: 44, decay: 0.92, gravity: 0.62, ticks: 180, scalar: 0.72, flat: true, shapes: ["circle"], colors: ["#fff7cc", "#fbbf24", "#fb7185", "#a78bfa", "#38bdf8", "#ffffff"], origin: { x, y } });
    [[0.18, 0.34], [0.82, 0.34], [0.34, 0.56], [0.66, 0.56]].forEach(([x, y], indice) => window.setTimeout(() => fuegoArtificial(x, y), indice * 180));
    return;
  }

  const posicionesConfeti = enPantallaPrevia ? [[0.18, 0.62], [0.82, 0.62], [0.34, 0.76], [0.66, 0.76]] : [[0.18, 0.34], [0.82, 0.34], [0.34, 0.56], [0.66, 0.56]];
  posicionesConfeti.forEach(([x, y], indice) => window.setTimeout(() => confetti({ ...opcionesBase, particleCount: enPantallaPrevia ? 28 : 34, spread: 80, startVelocity: 24, gravity: 0.8, colors: ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399"], origin: { x, y } }), indice * 180));
}

function lanzarExplosionesDeGlobos(tandas: 2 | 3, enPantallaPrevia = false) {
  const globo = confetti.shapeFromPath("M8 0C3.6 0 0 3.7 0 8.8c0 5.3 3.1 9.4 8 13.2v4.4l2-2.2v-2.2c4.9-3.8 8-7.9 8-13.2C18 3.7 14.4 0 10 0Z");
  const opcionesBase = { disableForReducedMotion: false, zIndex: 100 };
  const explotarGlobos = (x: number, y: number) => {
    confetti({ ...opcionesBase, particleCount: 25, spread: 74, startVelocity: 31, gravity: 0.42, decay: 0.91, scalar: 3.6, colors: ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399", "#fb923c"], shapes: [globo], origin: { x, y } });
    confetti({ ...opcionesBase, particleCount: 12, spread: 105, startVelocity: 19, gravity: 0.78, decay: 0.93, scalar: 0.62, colors: ["#ffffff", "#fef3c7", "#fde68a", "#fbbf24"], origin: { x, y } });
    confetti({ ...opcionesBase, particleCount: 7, spread: 360, startVelocity: 9, gravity: 0.16, decay: 0.88, scalar: 0.5, flat: true, shapes: ["circle"], colors: ["#ffffff", "#fef3c7"], origin: { x, y } });
  };
  const explosionesSuperiores = [[0.24, 0.47], [0.76, 0.47], [0.38, 0.61], [0.62, 0.61]];
  const explosionesInferiores = [[0.18, 0.95], [0.82, 0.95], [0.34, 0.84], [0.66, 0.84]];
  const explosionesPrevia = [[0.18, 0.62], [0.82, 0.62], [0.34, 0.76], [0.66, 0.76]];
  const lanzarTanda = (posiciones: number[][], retrasoInicial: number) => posiciones.forEach(([x, y], indice) => window.setTimeout(() => explotarGlobos(x, y), retrasoInicial + indice * 180));

  const posicionesPrimerasTandas = enPantallaPrevia ? explosionesPrevia : explosionesSuperiores;
  lanzarTanda(posicionesPrimerasTandas, 0);
  lanzarTanda(posicionesPrimerasTandas, 1300);
  if (tandas === 3) lanzarTanda(explosionesInferiores, 2600);
}

function crearEnlaceCalendario(evento: EventoPublico) {
  const inicio = new Date(evento.fechaHoraEvento);
  const fin = new Date(inicio.getTime() + 3 * 60 * 60 * 1000);
  const formatoGoogle = (fecha: Date) => fecha.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const parametros = new URLSearchParams({ text: `Cumpleaños de ${evento.nombreCumpleanero}`, dates: `${formatoGoogle(inicio)}/${formatoGoogle(fin)}`, location: `${evento.nombreLugar}, ${evento.direccion}` });
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&${parametros.toString()}`;
}
