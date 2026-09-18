"use client";

import confetti from "canvas-confetti";
import { FormEvent, useEffect, useRef, useState } from "react";
import { CalendarDays, Check, MailOpen, MapPin, Palette, Sparkles, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { NavbarPrivado } from "../../../components/NavbarPrivado";
import { esImagenPermitida, optimizarImagen, TAMANO_MAXIMO_ORIGINAL_BYTES, TAMANO_MAXIMO_SUBIDA_BYTES, TIPO_GIF } from "../../../lib/imagenes";

const API_URL = "/api/backend";

type Usuario = { id: string };
type Evento = { id: string; nombreCumpleanero: string; fechaHoraEvento: string; nombreLugar: string; direccion: string; enlacePublico: string; plantillaDisenoId: string | null; efectoFondoId: string | null; efectoAperturaId: string | null; configuracionDiseno: Record<string, unknown> };
type Plantilla = { id: string; nombre: string; colorPrimario: string | null; colorSecundario: string | null; efectoFondoPredeterminadoId: string | null; efectoAperturaPredeterminadoId: string | null };
type Efecto = { id: string; clave: string; nombre: string };

export default function EditarInvitacionPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [colorPrimario, setColorPrimario] = useState("#1E293B");
  const [colorSecundario, setColorSecundario] = useState("#F8FAFC");
  const [imagenPortadaUrl, setImagenPortadaUrl] = useState("");
  const [archivoPortada, setArchivoPortada] = useState<File | null>(null);
  const vistaPreviaTemporal = useRef<string | null>(null);
  const entradaArchivoPortada = useRef<HTMLInputElement>(null);
  const [imagenEnPantallaApertura, setImagenEnPantallaApertura] = useState(true);
  const [imagenEnFondoInvitacion, setImagenEnFondoInvitacion] = useState(true);
  const [imagenEnTarjetaPrincipal, setImagenEnTarjetaPrincipal] = useState(true);
  const [efectosFondo, setEfectosFondo] = useState<Efecto[]>([]);
  const [efectosApertura, setEfectosApertura] = useState<Efecto[]>([]);
  const [efectoFondoId, setEfectoFondoId] = useState("");
  const [efectoAperturaId, setEfectoAperturaId] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const sesion = localStorage.getItem("tudia.usuario");
    if (!sesion) { router.replace("/login"); return; }

    Promise.all([
      fetch(`${API_URL}/api/eventos/${id}`).then((respuesta) => respuesta.ok ? respuesta.json() as Promise<Evento> : Promise.reject()),
      fetch(`${API_URL}/api/plantillas-diseno`).then((respuesta) => respuesta.ok ? respuesta.json() as Promise<Plantilla[]> : Promise.reject()),
      fetch(`${API_URL}/api/efectos/fondo`).then((respuesta) => respuesta.ok ? respuesta.json() as Promise<Efecto[]> : Promise.reject()),
      fetch(`${API_URL}/api/efectos/apertura`).then((respuesta) => respuesta.ok ? respuesta.json() as Promise<Efecto[]> : Promise.reject()),
    ])
      .then(([eventoActual, plantillasDisponibles, fondosDisponibles, aperturasDisponibles]) => {
        const plantilla = plantillasDisponibles.find((item) => item.id === eventoActual.plantillaDisenoId);
        const configuracion = eventoActual.configuracionDiseno ?? {};
        setEvento(eventoActual);
        setEfectosFondo(fondosDisponibles);
        setEfectosApertura(aperturasDisponibles);
        setColorPrimario(valorTexto(configuracion, "colorPrimario", plantilla?.colorPrimario ?? "#1E293B"));
        setColorSecundario(valorTexto(configuracion, "colorSecundario", plantilla?.colorSecundario ?? "#F8FAFC"));
        setImagenPortadaUrl(valorTexto(configuracion, "imagenPortadaUrl", ""));
        setImagenEnPantallaApertura(valorBooleano(configuracion, "imagenEnPantallaApertura", true));
        setImagenEnFondoInvitacion(valorBooleano(configuracion, "imagenEnFondoInvitacion", true));
        setImagenEnTarjetaPrincipal(valorBooleano(configuracion, "imagenEnTarjetaPrincipal", true));
        setEfectoFondoId(eventoActual.efectoFondoId ?? plantilla?.efectoFondoPredeterminadoId ?? fondosDisponibles.find((efecto) => efecto.clave === valorTexto(configuracion, "efectoFondo", efectoInicial(plantilla?.nombre)))?.id ?? "");
        setEfectoAperturaId(eventoActual.efectoAperturaId ?? plantilla?.efectoAperturaPredeterminadoId ?? aperturasDisponibles.find((efecto) => efecto.clave === valorTexto(configuracion, "efectoApertura", efectoAperturaInicial(plantilla?.nombre)))?.id ?? "");
      })
      .catch(() => setError("No se pudo cargar la invitación."))
      .finally(() => setCargando(false));
  }, [id, router]);

  async function guardar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const sesion = localStorage.getItem("tudia.usuario");
    if (!sesion) { router.replace("/login"); return; }
    setError("");
    setGuardado(false);
    setGuardando(true);

    try {
      const usuario = JSON.parse(sesion) as Usuario;
      let imagenPortadaParaGuardar = imagenPortadaUrl;
      if (archivoPortada) {
        const datosArchivo = new FormData();
        datosArchivo.append("archivo", archivoPortada);
        const respuestaArchivo = await fetch(`${API_URL}/api/archivos/portadas`, { method: "POST", body: datosArchivo });
        if (!respuestaArchivo.ok) throw new Error();
        const archivoSubido = await respuestaArchivo.json() as { url: string };
        imagenPortadaParaGuardar = archivoSubido.url;
        if (vistaPreviaTemporal.current) URL.revokeObjectURL(vistaPreviaTemporal.current);
        vistaPreviaTemporal.current = null;
        setImagenPortadaUrl(archivoSubido.url);
        setArchivoPortada(null);
      }
      const respuesta = await fetch(`${API_URL}/api/eventos/${id}/invitacion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: usuario.id, configuracionDiseno: { colorPrimario, colorSecundario, imagenPortadaUrl: imagenPortadaParaGuardar, imagenEnPantallaApertura, imagenEnFondoInvitacion, imagenEnTarjetaPrincipal }, efectoFondoId: efectoFondoId || null, efectoAperturaId: efectoAperturaId || null }),
      });
      if (!respuesta.ok) throw new Error();
      setGuardado(true);
    } catch {
      setError("No se pudieron guardar los cambios. Intentá nuevamente.");
    } finally {
      setGuardando(false);
    }
  }

  async function seleccionarImagenPortada(archivo: File | undefined) {
    if (!archivo) return;
    if (!esImagenPermitida(archivo)) {
      setError("Elegí una imagen JPG, PNG, WEBP o GIF.");
      return;
    }
    if (archivo.size > (archivo.type === TIPO_GIF ? TAMANO_MAXIMO_SUBIDA_BYTES : TAMANO_MAXIMO_ORIGINAL_BYTES)) {
      setError(archivo.type === TIPO_GIF ? "El GIF no puede superar 5 MB." : "La imagen original no puede superar 20 MB.");
      return;
    }
    setError("");
    let imagenOptimizada: File;
    try {
      imagenOptimizada = await optimizarImagen(archivo, 1920);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pudimos optimizar la imagen.");
      return;
    }
    if (imagenOptimizada.size > TAMANO_MAXIMO_SUBIDA_BYTES) {
      setError("La imagen optimizada supera 5 MB. Elegí una imagen con menos detalle.");
      return;
    }
    if (vistaPreviaTemporal.current) URL.revokeObjectURL(vistaPreviaTemporal.current);
    const vistaTemporal = URL.createObjectURL(imagenOptimizada);
    vistaPreviaTemporal.current = vistaTemporal;
    setArchivoPortada(imagenOptimizada);
    setImagenPortadaUrl(vistaTemporal);
  }

  function cambiarUrlPortada(url: string) {
    if (vistaPreviaTemporal.current) URL.revokeObjectURL(vistaPreviaTemporal.current);
    vistaPreviaTemporal.current = null;
    setArchivoPortada(null);
    setImagenPortadaUrl(url);
  }

  function quitarImagenPortada() {
    if (vistaPreviaTemporal.current) URL.revokeObjectURL(vistaPreviaTemporal.current);
    vistaPreviaTemporal.current = null;
    setArchivoPortada(null);
    setImagenPortadaUrl("");
    if (entradaArchivoPortada.current) entradaArchivoPortada.current.value = "";
  }

  if (cargando) return <main className="grid min-h-screen place-items-center text-slate-600">Cargando editor...</main>;
  if (!evento) return <main className="grid min-h-screen place-items-center p-6 text-slate-700">{error || "No encontramos el evento."}</main>;

  const efectoFondo = efectosFondo.find((efecto) => efecto.id === efectoFondoId)?.clave ?? efectoInicial(undefined);
  const efectoApertura = efectosApertura.find((efecto) => efecto.id === efectoAperturaId)?.clave ?? efectoAperturaInicial(undefined);

  return <NavbarPrivado><main className="p-4 sm:p-8"><div className="mx-auto w-full sm:w-4/5">
    <header><h1 className="text-2xl font-semibold text-slate-900">Editar invitación de {evento.nombreCumpleanero}</h1></header>
    <form onSubmit={guardar} className="mt-6 grid gap-6 lg:items-center lg:grid-cols-[3fr_7fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2"><Palette size={19} /><h2 className="font-semibold text-slate-900">Colores e imagen</h2></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <SelectorColor etiqueta="Color principal" valor={colorPrimario} alCambiar={setColorPrimario} />
          <SelectorColor etiqueta="Color secundario" valor={colorSecundario} alCambiar={setColorSecundario} />
        </div>
        <label className="mt-5 block text-sm font-medium text-slate-800">Imagen de portada<input ref={entradaArchivoPortada} onChange={(event) => void seleccionarImagenPortada(event.target.files?.[0])} accept="image/jpeg,image/png,image/webp,image/gif" type="file" className="mt-1 block w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200" /></label>
        {archivoPortada && <p className="mt-2 text-xs text-slate-600">Imagen seleccionada: {archivoPortada.name}. Se subirá al guardar{archivoPortada.type === TIPO_GIF ? " sin cambios" : " en formato WebP"}.</p>}
        {imagenPortadaUrl.startsWith("/uploads/") && <p className="mt-3 text-xs font-medium text-emerald-700">Imagen local guardada.</p>}
        <label className="mt-4 block text-sm font-medium text-slate-800">O usá una URL externa (opcional)<input value={imagenPortadaUrl.startsWith("blob:") || imagenPortadaUrl.startsWith("/uploads/") ? "" : imagenPortadaUrl} onChange={(event) => cambiarUrlPortada(event.target.value)} type="url" placeholder="https://..." className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-slate-500" /></label>
        {imagenPortadaUrl && <button type="button" onClick={quitarImagenPortada} className="mt-3 w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50">Quitar imagen de portada</button>}
        <div className="mt-5 space-y-3 rounded-xl border border-slate-200 p-3"><p className="text-sm font-medium text-slate-800">Dónde mostrar la imagen</p><Interruptor etiqueta="Pantalla “Abrir invitación”" activo={imagenEnPantallaApertura} alCambiar={setImagenEnPantallaApertura} /><Interruptor etiqueta="Fondo de la invitación" activo={imagenEnFondoInvitacion} alCambiar={setImagenEnFondoInvitacion} /><Interruptor etiqueta="Tarjeta principal" activo={imagenEnTarjetaPrincipal} alCambiar={setImagenEnTarjetaPrincipal} /></div>
        <div className="mt-6 flex items-center gap-2"><Sparkles size={19} /><h2 className="font-semibold text-slate-900">Efecto de fondo</h2></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{efectosFondo.map((efecto) => <button key={efecto.id} type="button" onClick={() => setEfectoFondoId(efecto.id)} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${efectoFondoId === efecto.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}>{efecto.nombre}</button>)}</div>
        <div className="mt-6 flex items-center gap-2"><Sparkles size={19} /><h2 className="font-semibold text-slate-900">Efecto al abrir</h2></div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{efectosApertura.map((efecto) => <button key={efecto.id} type="button" onClick={() => setEfectoAperturaId(efecto.id)} className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${efectoAperturaId === efecto.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}>{efecto.nombre}</button>)}</div>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        {guardado && <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"><Check size={17} /> Cambios guardados.</p>}
        <div className="mt-6 grid gap-2"><button disabled={guardando} type="submit" className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-60">{guardando ? "Guardando..." : "Guardar invitación"}</button><a href={`/invitacion/${evento.enlacePublico}`} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-medium text-slate-700 transition hover:border-slate-500 hover:bg-slate-50">Ver invitación</a></div>
      </section>
      <VistaPreviaCompleta evento={evento} colorPrimario={colorPrimario} colorSecundario={colorSecundario} imagenPortadaUrl={imagenPortadaUrl} imagenEnPantallaApertura={imagenEnPantallaApertura} imagenEnFondoInvitacion={imagenEnFondoInvitacion} imagenEnTarjetaPrincipal={imagenEnTarjetaPrincipal} efectoFondo={efectoFondo} efectoApertura={efectoApertura} />
    </form>
  </div></main></NavbarPrivado>;
}

function SelectorColor({ etiqueta, valor, alCambiar }: { etiqueta: string; valor: string; alCambiar: (valor: string) => void }) {
  return <label className="block text-sm font-medium text-slate-800">{etiqueta}<span className="mt-1 flex items-center gap-2 rounded-lg border border-slate-200 p-2"><input aria-label={etiqueta} value={valor} onChange={(event) => alCambiar(event.target.value)} type="color" className="size-8 cursor-pointer border-0 bg-transparent p-0" /><span className="text-xs uppercase text-slate-600">{valor}</span></span></label>;
}

function Interruptor({ etiqueta, activo, alCambiar }: { etiqueta: string; activo: boolean; alCambiar: (activo: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-3 text-sm text-slate-700"><span>{etiqueta}</span><input aria-label={etiqueta} checked={activo} onChange={(event) => alCambiar(event.target.checked)} type="checkbox" className="peer sr-only" /><span className="relative h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-900 after:absolute after:left-1 after:top-1 after:size-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" /></label>;
}

function VistaPreviaCompleta({ evento, colorPrimario, colorSecundario, imagenPortadaUrl, imagenEnPantallaApertura, imagenEnFondoInvitacion, imagenEnTarjetaPrincipal, efectoFondo, efectoApertura }: { evento: Evento; colorPrimario: string; colorSecundario: string; imagenPortadaUrl: string; imagenEnPantallaApertura: boolean; imagenEnFondoInvitacion: boolean; imagenEnTarjetaPrincipal: boolean; efectoFondo: string; efectoApertura: string }) {
  const [invitacionAbierta, setInvitacionAbierta] = useState(false);
  const [destelloFuegos, setDestelloFuegos] = useState(false);
  const lienzoConfeti = useRef<HTMLCanvasElement>(null);
  const explosionEjecutada = useRef(false);
  const ultimoEfectoApertura = useRef(efectoApertura);
  const fondoApertura = fondoDeInvitacion(imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnPantallaApertura);
  const fondoInvitacion = fondoDeInvitacion(imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnFondoInvitacion);
  const fondoTarjeta = fondoDeInvitacion(imagenPortadaUrl, colorPrimario, colorSecundario, imagenEnTarjetaPrincipal);
  const fecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(evento.fechaHoraEvento));
  const direccionVisible = sinCoordenadas(evento.direccion);

  useEffect(() => {
    if (ultimoEfectoApertura.current !== efectoApertura) {
      ultimoEfectoApertura.current = efectoApertura;
      explosionEjecutada.current = false;
    }
    if (invitacionAbierta || explosionEjecutada.current || !lienzoConfeti.current) return;
    const temporizador = window.setTimeout(() => {
      if (!lienzoConfeti.current) return;
      if (efectoApertura === "fuegos-artificiales") {
        setDestelloFuegos(true);
        window.setTimeout(() => setDestelloFuegos(false), 1600);
      }
      lanzarEfectoAperturaEnPrevia(lienzoConfeti.current, efectoApertura);
      explosionEjecutada.current = true;
    }, 350);
    return () => window.clearTimeout(temporizador);
  }, [efectoApertura, invitacionAbierta]);

  if (!invitacionAbierta) return <aside className="overflow-hidden rounded-2xl shadow-sm"><div className="relative min-h-[42rem] overflow-hidden bg-cover bg-center p-5" style={{ backgroundImage: fondoApertura }}>
    <EfectoVistaPrevia efecto={efectoFondo} />
    {destelloFuegos && <DestellosFuegos />}
    <canvas ref={lienzoConfeti} aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full" />
    <p className="relative z-10 text-xs font-semibold tracking-widest text-white/70">VISTA PREVIA · PANTALLA INICIAL</p>
    <div className="relative z-10 flex min-h-[calc(42rem-3rem)] flex-col items-center justify-center text-center text-white"><div className="grid size-14 place-items-center rounded-full bg-white/20 shadow-lg"><MailOpen size={25} /></div><p className="mt-6 text-xs font-semibold uppercase tracking-[.18em] text-white/80">Tenés una invitación especial</p><h2 className="mt-3 text-3xl font-semibold">De {evento.nombreCumpleanero}</h2><p className="mt-3 text-sm leading-6 text-white/90">Hay una celebración esperando por vos.</p><button type="button" onClick={() => setInvitacionAbierta(true)} className="mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-semibold text-white shadow-lg ring-2 ring-white/35" style={{ backgroundColor: colorPrimario }}><MailOpen size={19} /> Abrir invitación</button></div>
  </div></aside>;

  return <aside className="relative flex min-h-[42rem] items-center overflow-hidden rounded-2xl bg-cover bg-center p-4 shadow-sm" style={{ backgroundImage: fondoInvitacion }}>
    <EfectoVistaPrevia efecto={efectoFondo} />
    {destelloFuegos && <DestellosFuegos />}
    <div className="relative z-10 mx-auto w-full max-w-lg"><div className="relative overflow-hidden rounded-2xl bg-cover bg-center px-5 py-10 text-center text-white shadow-lg" style={{ backgroundImage: fondoTarjeta }}><EfectoVistaPrevia efecto={efectoFondo} /><div className="relative z-10"><button type="button" onClick={() => setInvitacionAbierta(false)} className="text-xs text-white/80 underline">← Volver a portada</button><p className="mt-7 text-xs font-semibold tracking-[.18em] text-white/80">ESTÁS INVITADO/A</p><h2 className="mt-3 text-3xl font-semibold">{evento.nombreCumpleanero}</h2><p className="mt-3 text-sm leading-6 text-white/90">Quiero compartir este día especial con vos. ¡Te espero para festejar!</p></div></div>
      <div className="mt-6 space-y-3 rounded-[1.6rem] border border-white/25 bg-white/10 p-4 text-sm shadow-lg backdrop-blur-sm"><div className="flex items-center gap-2 text-white"><span className="grid size-8 place-items-center rounded-xl bg-white/20"><CalendarDays size={15} /></span><p className="text-xs font-semibold tracking-wider">LA CELEBRACIÓN</p></div><div className="rounded-2xl border border-white/70 bg-white/90 p-4 text-slate-600 shadow-sm"><div className="flex gap-3"><span className="grid size-9 place-items-center rounded-xl" style={{ color: colorPrimario, backgroundColor: `${colorPrimario}18` }}><CalendarDays size={17} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Cuándo</p><p className="mt-1 font-semibold text-slate-900">{fecha}</p></div></div></div><div className="rounded-2xl border border-white/70 bg-white/90 p-4 text-slate-600 shadow-sm"><div className="flex gap-3"><span className="grid size-9 place-items-center rounded-xl" style={{ color: colorPrimario, backgroundColor: `${colorPrimario}18` }}><MapPin size={17} /></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Dónde</p><p className="mt-1 font-semibold text-slate-900">{evento.nombreLugar}</p>{direccionVisible && <p>{direccionVisible}</p>}</div></div></div><div className="rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm"><div className="flex items-center gap-2 text-slate-900"><span className="grid size-8 place-items-center rounded-xl text-white" style={{ backgroundColor: colorPrimario }}><Users size={15} /></span><p className="font-semibold">Confirmá asistencia</p></div><div className="mt-3 grid grid-cols-2 gap-2"><span className="rounded-xl px-3 py-2.5 text-center text-white shadow-sm" style={{ backgroundColor: colorPrimario }}>Sí, asistiré</span><span className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center text-slate-600">No podré asistir</span></div></div></div>
    </div>
  </aside>;
}

function DestellosFuegos() {
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"><span className="firework-glow" style={{ left: "4%", top: "12%" }} /><span className="firework-glow" style={{ left: "63%", top: "2%", animationDelay: "230ms" }} /><span className="firework-glow" style={{ left: "18%", top: "31%", animationDelay: "460ms" }} /><span className="firework-glow" style={{ left: "50%", top: "31%", animationDelay: "690ms" }} /></div>;
}

function LluviaDeEstrellas({ comoFondo = false }: { comoFondo?: boolean }) {
  const posiciones = [[4, 2], [12, 28], [21, 10], [30, 42], [39, 4], [48, 24], [57, 12], [66, 38], [75, 6], [84, 30], [93, 16], [8, 54], [26, 62], [45, 48], [62, 58], [80, 52], [96, 68]];
  const claseEstrella = comoFondo ? "luminous-rain-star luminous-rain-star-background" : "luminous-rain-star";
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{posiciones.map(([left, top], indice) => <span key={indice} className={claseEstrella} style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${indice * 340}ms` }}>✦</span>)}</div>;
}

function lanzarEfectoAperturaEnPrevia(lienzo: HTMLCanvasElement, efecto: string) {
  const lanzarConfeti = confetti.create(lienzo, { resize: true, useWorker: true });
  if (efecto === "fuegos-artificiales") {
    [[0.18, 0.4], [0.82, 0.4], [0.34, 0.62], [0.66, 0.62]].forEach(([x, y], indice) => window.setTimeout(() => lanzarConfeti({ particleCount: 78, spread: 360, startVelocity: 42, gravity: 0.62, decay: 0.92, ticks: 180, scalar: 0.7, flat: true, shapes: ["circle"], colors: ["#fff7cc", "#fbbf24", "#fb7185", "#a78bfa", "#38bdf8", "#ffffff"], origin: { x, y } }), indice * 230));
    return;
  }
  if (efecto === "confeti") {
    [[0.18, 0.62], [0.82, 0.62], [0.34, 0.76], [0.66, 0.76]].forEach(([x, y], indice) => window.setTimeout(() => lanzarConfeti({ particleCount: 28, spread: 80, startVelocity: 24, gravity: 0.8, colors: ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399"], origin: { x, y } }), indice * 180));
    return;
  }
  const globo = confetti.shapeFromPath("M8 0C3.6 0 0 3.7 0 8.8c0 5.3 3.1 9.4 8 13.2v4.4l2-2.2v-2.2c4.9-3.8 8-7.9 8-13.2C18 3.7 14.4 0 10 0Z");
  const explotar = (x: number, y: number) => {
    lanzarConfeti({ particleCount: 25, spread: 74, startVelocity: 31, gravity: 0.42, decay: 0.91, scalar: 2.4, colors: ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399", "#fb923c"], shapes: [globo], origin: { x, y } });
    lanzarConfeti({ particleCount: 12, spread: 105, startVelocity: 19, gravity: 0.78, decay: 0.93, scalar: 0.45, colors: ["#ffffff", "#fef3c7", "#fde68a", "#fbbf24"], origin: { x, y } });
    lanzarConfeti({ particleCount: 7, spread: 360, startVelocity: 9, gravity: 0.16, decay: 0.88, scalar: 0.36, flat: true, shapes: ["circle"], colors: ["#ffffff", "#fef3c7"], origin: { x, y } });
  };
  const posiciones = [[0.24, 0.56], [0.76, 0.56], [0.38, 0.68], [0.62, 0.68]];
  const posicionesInferiores = [[0.2, 0.84], [0.8, 0.84], [0.38, 0.74], [0.62, 0.74]];
  const lanzarTanda = (posicionesTanda: number[][], demora: number) => posicionesTanda.forEach(([x, y]) => window.setTimeout(() => explotar(x, y), demora));
  lanzarTanda(posiciones, 0);
  lanzarTanda(posiciones, 1300);
  lanzarTanda(posicionesInferiores, 2600);
}

function EfectoVistaPrevia({ efecto }: { efecto: string }) {
  const posiciones = [[8, 18], [28, 52], [48, 22], [68, 62], [86, 30]];
  if (efecto === "lluvia-estrellas") return <LluviaDeEstrellas comoFondo />;
  if (efecto === "estrellas-fugaces") return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{posiciones.slice(0, 3).map(([izquierda, arriba], indice) => <span key={indice} className="shooting-star shooting-star-card" style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * .8}s` }} />)}</div>;
  if (efecto === "estrellas-doradas") { const posicionesDoradas = [[5, 10], [16, 40], [28, 20], [39, 65], [50, 8], [61, 42], [72, 22], [83, 58], [94, 32]]; return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{posicionesDoradas.map(([izquierda, arriba], indice) => <span key={indice} className="absolute animate-[invite-float_4s_ease-in-out_infinite] text-lg text-amber-100 drop-shadow-[0_0_6px_rgba(251,191,36,.9)]" style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * .28}s` }}>✦</span>)}</div>; }
  if (efecto === "puntos-de-luz") return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{posiciones.map(([izquierda, arriba], indice) => <span key={indice} className="background-light absolute size-1.5 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,.65)] animate-[minimal-glow_4.5s_ease-in-out_infinite]" style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * .45}s` }} />)}</div>;
  const colores = ["#fb7185", "#facc15", "#38bdf8", "#a78bfa", "#34d399"];
  return <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">{posiciones.map(([izquierda, arriba], indice) => <span key={indice} className="background-balloon absolute animate-[invite-float_4s_ease-in-out_infinite]" style={{ left: `${izquierda}%`, top: `${arriba}%`, animationDelay: `${indice * .4}s`, "--balloon-color": colores[indice] } as React.CSSProperties} />)}</div>;
}

function valorTexto(configuracion: Record<string, unknown>, clave: string, predeterminado: string) { return typeof configuracion[clave] === "string" ? configuracion[clave] as string : predeterminado; }
function valorBooleano(configuracion: Record<string, unknown>, clave: string, predeterminado: boolean) { return typeof configuracion[clave] === "boolean" ? configuracion[clave] as boolean : predeterminado; }
function fondoDeInvitacion(imagen: string, colorPrimario: string, colorSecundario: string, mostrarImagen: boolean) { return mostrarImagen && imagen ? `linear-gradient(135deg, ${colorPrimario}e6, ${colorSecundario}d9), url(${imagen})` : `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})`; }
function sinCoordenadas(direccion: string) { return direccion.replace(/\(?\s*-?\d{1,3}[.,]\d+\s*,\s*-?\d{1,3}[.,]\d+\s*\)?/g, "").replace(/\s{2,}/g, " ").replace(/^\s*[-,·|]\s*|\s*[-,·|]\s*$/g, "").trim(); }
function efectoInicial(nombrePlantilla: string | undefined) { const nombre = (nombrePlantilla ?? "").toLowerCase(); if (nombre.includes("neón")) return "estrellas-fugaces"; if (nombre.includes("dorado")) return "estrellas-doradas"; if (nombre.includes("minimalista")) return "puntos-de-luz"; return "globos"; }
function efectoAperturaInicial(nombrePlantilla: string | undefined) { const nombre = (nombrePlantilla ?? "").toLowerCase(); if (nombre.includes("dorado")) return "fuegos-artificiales"; if (nombre.includes("minimalista") || nombre.includes("neón")) return "confeti"; return "globos-explosion"; }
