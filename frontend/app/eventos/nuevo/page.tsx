"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Palette, Sparkles } from "lucide-react";
import { NavbarPrivado } from "../../components/NavbarPrivado";

const API_URL = "/api/backend";
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const MAP_CENTER = { lat: -34.6037, lng: -58.3816 };

type Usuario = { id: string };
type Coordenadas = { lat: number; lng: number };
type PlantillaDiseno = {
  id: string;
  nombre: string;
  descripcion: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  tipoAnimacion: string | null;
};
type MapaInstancia = {
  addListener: (evento: string, callback: (evento: { latLng?: { lat: () => number; lng: () => number } }) => void) => void;
  setCenter: (centro: Coordenadas) => void;
  setZoom: (zoom: number) => void;
};
type GoogleMapsApi = {
  maps: {
    Map: new (elemento: HTMLElement, opciones: { center: Coordenadas; zoom: number }) => MapaInstancia;
    Marker: new (opciones: { map: unknown; position: Coordenadas }) => { setPosition: (posicion: Coordenadas) => void };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsApi;
  }
}

export default function CrearEventoPage() {
  const router = useRouter();
  const mapaRef = useRef<HTMLDivElement>(null);
  const instanciaMapaRef = useRef<MapaInstancia | null>(null);
  const marcadorRef = useRef<{ setPosition: (posicion: Coordenadas) => void } | null>(null);
  const direccionActualRef = useRef("");
  const [direccion, setDireccion] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [plantillas, setPlantillas] = useState<PlantillaDiseno[]>([]);
  const [plantillaDisenoId, setPlantillaDisenoId] = useState<string | null>(null);
  const [cargandoPlantillas, setCargandoPlantillas] = useState(true);
  const [errorPlantillas, setErrorPlantillas] = useState("");
  const [error, setError] = useState("");
  const [errorMapa, setErrorMapa] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("tudia.usuario")) router.replace("/login");
  }, [router]);

  useEffect(() => {
    fetch(`${API_URL}/api/plantillas-diseno`)
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error();
        return (await respuesta.json()) as PlantillaDiseno[];
      })
      .then((plantillasDisponibles) => {
        setPlantillas(plantillasDisponibles);
        setPlantillaDisenoId(plantillasDisponibles[0]?.id ?? null);
      })
      .catch(() => setErrorPlantillas("No se pudieron cargar los diseños."))
      .finally(() => setCargandoPlantillas(false));
  }, []);

  useEffect(() => {
    if (!MAPS_API_KEY || !mapaRef.current) return;

    const iniciarMapa = () => {
      if (!window.google || !mapaRef.current) return;

      const coordenadasIniciales = obtenerCoordenadas(direccionActualRef.current) ?? MAP_CENTER;
      const mapa = new window.google.maps.Map(mapaRef.current, { center: coordenadasIniciales, zoom: coordenadasIniciales === MAP_CENTER ? 12 : 16 });
      const marcador = new window.google.maps.Marker({ map: mapa as unknown, position: coordenadasIniciales });
      instanciaMapaRef.current = mapa;
      marcadorRef.current = marcador;

      mapa.addListener("click", (evento) => {
        if (!evento.latLng) return;
        const punto = { lat: evento.latLng.lat(), lng: evento.latLng.lng() };
        marcador.setPosition(punto);
        setLatitud(String(punto.lat));
        setLongitud(String(punto.lng));
        setErrorMapa("");
      });
    };

    if (window.google) {
      iniciarMapa();
      return;
    }

    const idScript = "google-maps-api";
    const existente = document.getElementById(idScript) as HTMLScriptElement | null;
    if (existente) {
      existente.addEventListener("load", iniciarMapa, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = idScript;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}`;
    script.async = true;
    script.onload = iniciarMapa;
    script.onerror = () => setErrorMapa("No se pudo cargar Google Maps. Revisá la clave configurada.");
    document.head.appendChild(script);
  }, []);

  function actualizarDireccion(valor: string) {
    direccionActualRef.current = valor;
    setDireccion(valor);

    const punto = obtenerCoordenadas(valor);
    if (!punto) return;

    setLatitud(String(punto.lat));
    setLongitud(String(punto.lng));
    marcadorRef.current?.setPosition(punto);
    instanciaMapaRef.current?.setCenter(punto);
    instanciaMapaRef.current?.setZoom(16);
  }

  async function crearEvento(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const latitudNumerica = Number(latitud);
    const longitudNumerica = Number(longitud);
    if (!direccion.trim()) {
      setError("Ingresá la dirección que querés mostrar en la invitación.");
      return;
    }
    if (!Number.isFinite(latitudNumerica) || !Number.isFinite(longitudNumerica)) {
      setError("Seleccioná el punto del lugar en el mapa o ingresá sus coordenadas.");
      return;
    }

    setEnviando(true);
    const formulario = new FormData(event.currentTarget);
    const sesion = localStorage.getItem("tudia.usuario");

    if (!sesion) {
      router.replace("/login");
      return;
    }

    try {
      const usuario = JSON.parse(sesion) as Usuario;
      const respuesta = await fetch(`${API_URL}/api/eventos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: usuario.id,
          nombreCumpleanero: String(formulario.get("nombreCumpleanero")),
          fechaNacimiento: String(formulario.get("fechaNacimiento")),
          fechaHoraEvento: String(formulario.get("fechaHoraEvento")),
          nombreLugar: String(formulario.get("nombreLugar")),
          direccion,
          latitud: latitudNumerica,
          longitud: longitudNumerica,
          estado: "BORRADOR",
          plantillaDisenoId,
          configuracionDiseno: {},
        }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { mensaje?: string } | null;

      if (!respuesta.ok) {
        setError(cuerpo?.mensaje ?? "No se pudo crear el evento.");
        return;
      }

      router.replace("/dashboard");
    } catch {
      setError("No se pudo conectar con el backend. Verificá que esté iniciado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <NavbarPrivado>
    <main className="p-4 sm:p-8">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-2xl font-semibold text-slate-900">Crear evento</h1>
        <p className="mt-1 text-sm text-slate-600">Completá la información básica y elegí o ingresá la ubicación.</p>

        <form onSubmit={crearEvento} className="mt-6 grid gap-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <div className="space-y-4">
            <Campo nombre="nombreCumpleanero" etiqueta="Nombre del cumpleañero" maxLength={120} />
            <Campo nombre="fechaNacimiento" etiqueta="Fecha de nacimiento" tipo="date" />
            <Campo nombre="fechaHoraEvento" etiqueta="Fecha y hora del evento" tipo="datetime-local" />
            <Campo nombre="nombreLugar" etiqueta="Nombre del lugar" maxLength={160} />
          </div>

          <div>
            <p className="block text-sm font-medium text-slate-800">Ubicación</p>
            {!MAPS_API_KEY && <p className="mt-1 text-sm text-amber-700">Falta configurar `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` para elegir el punto en Google Maps.</p>}
            {errorMapa && <p className="mt-1 text-sm text-red-700">{errorMapa}</p>}
            {MAPS_API_KEY && <><div ref={mapaRef} className="mt-2 h-72 w-full rounded border border-slate-300" aria-label="Mapa para elegir ubicación" /><p className="mt-2 text-xs leading-5 text-slate-500">Marcá el punto en el mapa y escribí debajo la dirección que querés mostrar. No se consulta ningún servicio de geocodificación.</p></>}
            <label htmlFor="direccion" className="mt-3 block text-sm font-medium text-slate-800">Dirección</label>
            <input id="direccion" value={direccion} onChange={(event) => actualizarDireccion(event.target.value)} placeholder="Ej.: Av. Corrientes 1234, CABA" className="mt-1 w-full rounded border border-slate-300 px-3 py-2" />
            <div className="mt-3 grid grid-cols-2 gap-3"><div><label htmlFor="latitud" className="block text-xs font-medium text-slate-600">Latitud</label><input id="latitud" value={latitud} onChange={(event) => setLatitud(event.target.value)} inputMode="decimal" placeholder="-34.6037" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></div><div><label htmlFor="longitud" className="block text-xs font-medium text-slate-600">Longitud</label><input id="longitud" value={longitud} onChange={(event) => setLongitud(event.target.value)} inputMode="decimal" placeholder="-58.3816" className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm" /></div></div>
          </div>

          <section className="md:col-span-2">
            <div className="flex items-center gap-2">
              <Palette size={18} className="text-slate-700" />
              <div>
                <h2 className="font-medium text-slate-900">Diseño de invitación</h2>
                <p className="text-sm text-slate-600">Elegí el estilo que tendrá la invitación pública.</p>
              </div>
            </div>

            {cargandoPlantillas && <p className="mt-4 text-sm text-slate-600">Cargando diseños...</p>}
            {errorPlantillas && <p className="mt-4 text-sm text-red-700">{errorPlantillas}</p>}
            {!cargandoPlantillas && !errorPlantillas && plantillas.length === 0 && <p className="mt-4 text-sm text-slate-600">No hay diseños disponibles todavía.</p>}

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {plantillas.map((plantilla) => {
                const seleccionada = plantilla.id === plantillaDisenoId;
                const colorPrimario = plantilla.colorPrimario ?? "#1E293B";
                const colorSecundario = plantilla.colorSecundario ?? "#F8FAFC";

                return (
                  <button
                    key={plantilla.id}
                    type="button"
                    onClick={() => setPlantillaDisenoId(plantilla.id)}
                    aria-pressed={seleccionada}
                    className={`relative overflow-hidden rounded-lg border p-3 text-left transition ${seleccionada ? "border-slate-900 ring-2 ring-slate-900/20" : "border-slate-200 hover:border-slate-400"}`}
                  >
                    <div className="flex h-20 items-end rounded-md p-3" style={{ background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` }}>
                      <span className="rounded bg-white/85 px-2 py-1 text-xs font-semibold text-slate-800">{plantilla.nombre}</span>
                    </div>
                    <p className="mt-3 font-medium text-slate-900">{plantilla.nombre}</p>
                    <p className="mt-1 min-h-10 text-xs leading-5 text-slate-600">{plantilla.descripcion}</p>
                    <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-600"><Sparkles size={14} /> {plantilla.tipoAnimacion ?? "Sin animación"}</p>
                    {seleccionada && <span className="absolute right-5 top-5 rounded-full bg-slate-900 p-1 text-white"><Check size={14} strokeWidth={3} /></span>}
                  </button>
                );
              })}
            </div>
          </section>

          {error && <p className="text-sm text-red-700 md:col-span-2">{error}</p>}
          <button type="submit" disabled={enviando} className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2">
            {enviando ? "Creando evento..." : "Crear evento"}
          </button>
        </form>
      </div>
    </main>
    </NavbarPrivado>
  );
}

function obtenerCoordenadas(valor: string): Coordenadas | null {
  const coincidencia = valor.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!coincidencia) return null;

  const lat = Number(coincidencia[1]);
  const lng = Number(coincidencia[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function Campo({ nombre, etiqueta, tipo = "text", maxLength }: { nombre: string; etiqueta: string; tipo?: string; maxLength?: number }) {
  return (
    <div>
      <label htmlFor={nombre} className="block text-sm font-medium text-slate-800">{etiqueta}</label>
      <input id={nombre} name={nombre} type={tipo} required maxLength={maxLength} className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-700" />
    </div>
  );
}
