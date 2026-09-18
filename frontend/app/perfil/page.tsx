"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { AtSign, Camera, Check, LoaderCircle, Mail, Pencil, Trash2, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { NavbarPrivado } from "../components/NavbarPrivado";
import { esImagenPermitida, optimizarImagen, TAMANO_MAXIMO_ORIGINAL_BYTES, TAMANO_MAXIMO_SUBIDA_BYTES, TIPO_GIF } from "../lib/imagenes";

const API_URL = "/api/backend";
type CampoEditable = "nombre" | "username" | "correo";
type Usuario = { id: string; nombre: string; correo: string; username: string; fotoPerfil?: string | null };

export default function PerfilPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [campoEditando, setCampoEditando] = useState<CampoEditable | null>(null);
  const [valorEdicion, setValorEdicion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState("");
  const entradaFoto = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sesion = localStorage.getItem("tudia.usuario");
    if (!sesion) {
      router.replace("/login");
      return;
    }
    try {
      const usuarioGuardado = JSON.parse(sesion) as Usuario;
      queueMicrotask(() => setUsuario(usuarioGuardado));
    } catch {
      localStorage.removeItem("tudia.usuario");
      router.replace("/login");
    }
  }, [router]);

  function comenzarEdicion(campo: CampoEditable) {
    if (!usuario) return;
    setCampoEditando(campo);
    setValorEdicion(usuario[campo]);
    setError("");
  }

  async function actualizarUsuario(cambios: Partial<Usuario>) {
    if (!usuario) return false;
    const respuesta = await fetch(`${API_URL}/api/usuarios/${usuario.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...usuario, ...cambios }),
    });
    const cuerpo = await respuesta.json().catch(() => null) as (Usuario & { mensaje?: string }) | null;
    if (!respuesta.ok || !cuerpo) throw new Error(cuerpo?.mensaje ?? "No pudimos guardar el cambio.");
      setUsuario(cuerpo);
      localStorage.setItem("tudia.usuario", JSON.stringify(cuerpo));
      window.dispatchEvent(new Event("tudia:usuario-actualizado"));
      return true;
  }

  async function guardarCampo() {
    if (!usuario || !campoEditando || !valorEdicion.trim()) return;
    setGuardando(true);
    setError("");
    try {
      await actualizarUsuario({ [campoEditando]: valorEdicion.trim() });
      setCampoEditando(null);
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pudimos guardar el cambio.");
    } finally {
      setGuardando(false);
    }
  }

  async function subirFoto(event: ChangeEvent<HTMLInputElement>) {
    const archivo = event.target.files?.[0];
    if (!archivo || !usuario) return;
    if (!esImagenPermitida(archivo)) {
      setError("Elegí una imagen JPG, PNG, WEBP o GIF.");
      return;
    }
    if (archivo.size > (archivo.type === TIPO_GIF ? TAMANO_MAXIMO_SUBIDA_BYTES : TAMANO_MAXIMO_ORIGINAL_BYTES)) {
      setError(archivo.type === TIPO_GIF ? "El GIF no puede superar 5 MB." : "La imagen original no puede superar 20 MB.");
      return;
    }
    setSubiendoFoto(true);
    setError("");
    try {
      const imagenOptimizada = await optimizarImagen(archivo, 512);
      if (imagenOptimizada.size > TAMANO_MAXIMO_SUBIDA_BYTES) throw new Error("La imagen optimizada supera 5 MB. Elegí una imagen con menos detalle.");
      const datos = new FormData();
      datos.append("archivo", imagenOptimizada);
      const respuestaArchivo = await fetch(`${API_URL}/api/archivos/perfiles`, { method: "POST", body: datos });
      const archivoSubido = await respuestaArchivo.json().catch(() => null) as { url?: string; mensaje?: string } | null;
      if (!respuestaArchivo.ok || !archivoSubido?.url) throw new Error(archivoSubido?.mensaje ?? "No pudimos subir la foto.");
      await actualizarUsuario({ fotoPerfil: archivoSubido.url });
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pudimos actualizar la foto.");
    } finally {
      setSubiendoFoto(false);
      event.target.value = "";
    }
  }

  async function quitarFoto() {
    setSubiendoFoto(true);
    setError("");
    try {
      await actualizarUsuario({ fotoPerfil: null });
    } catch (causa) {
      setError(causa instanceof Error ? causa.message : "No pudimos quitar la foto.");
    } finally {
      setSubiendoFoto(false);
    }
  }

  if (!usuario) return <main className="grid min-h-screen place-items-center text-slate-600">Cargando perfil...</main>;
  const inicial = usuario.nombre.trim().charAt(0).toUpperCase() || "U";
  const cancelar = () => { setCampoEditando(null); setError(""); };

  return <NavbarPrivado><main className="p-4 sm:p-8"><section className="mx-auto w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <div className="flex flex-col items-center text-center"><div className="group relative grid size-24 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 to-orange-400 text-3xl font-semibold text-white shadow-lg">{usuario.fotoPerfil ? <Image src={usuario.fotoPerfil} alt={`Foto de ${usuario.nombre}`} width={96} height={96} unoptimized className="size-full object-cover" /> : inicial}<button type="button" onClick={() => entradaFoto.current?.click()} disabled={subiendoFoto} className="absolute inset-0 grid place-items-center bg-slate-950/55 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100 disabled:opacity-100" aria-label="Cambiar foto de perfil">{subiendoFoto ? <LoaderCircle size={24} className="animate-spin" /> : <Camera size={24} />}</button></div><input ref={entradaFoto} onChange={subirFoto} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" /><div className="mt-3 flex items-center gap-2"><button type="button" onClick={() => entradaFoto.current?.click()} disabled={subiendoFoto} className="text-xs font-semibold text-pink-600 hover:text-pink-700 disabled:opacity-50">Cambiar foto</button>{usuario.fotoPerfil && <button type="button" onClick={() => void quitarFoto()} disabled={subiendoFoto} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600 disabled:opacity-50"><Trash2 size={13} /> Quitar</button>}</div><h1 className="mt-4 text-2xl font-semibold text-slate-900">Mi perfil</h1><p className="mt-1 text-sm text-slate-600">Pasá el cursor sobre un dato para editarlo.</p></div>
    <div className="mt-8 divide-y divide-slate-100 rounded-2xl border border-slate-200"><Dato campo="nombre" icono={<UserRound size={18} />} etiqueta="Nombre" valor={usuario.nombre} editando={campoEditando === "nombre"} valorEdicion={valorEdicion} guardando={guardando} alEditar={comenzarEdicion} alCambiar={setValorEdicion} alGuardar={guardarCampo} alCancelar={cancelar} /><Dato campo="username" icono={<AtSign size={18} />} etiqueta="Usuario" valor={usuario.username} editando={campoEditando === "username"} valorEdicion={valorEdicion} guardando={guardando} alEditar={comenzarEdicion} alCambiar={setValorEdicion} alGuardar={guardarCampo} alCancelar={cancelar} /><Dato campo="correo" icono={<Mail size={18} />} etiqueta="Correo electrónico" valor={usuario.correo} editando={campoEditando === "correo"} valorEdicion={valorEdicion} guardando={guardando} alEditar={comenzarEdicion} alCambiar={setValorEdicion} alGuardar={guardarCampo} alCancelar={cancelar} /></div>
    {error && <p className="mt-4 text-center text-sm text-red-700">{error}</p>}
  </section></main></NavbarPrivado>;
}

function Dato({ campo, icono, etiqueta, valor, editando, valorEdicion, guardando, alEditar, alCambiar, alGuardar, alCancelar }: { campo: CampoEditable; icono: React.ReactNode; etiqueta: string; valor: string; editando: boolean; valorEdicion: string; guardando: boolean; alEditar: (campo: CampoEditable) => void; alCambiar: (valor: string) => void; alGuardar: () => void; alCancelar: () => void }) {
  return <div className="group flex items-center gap-3 px-4 py-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">{icono}</span><div className="min-w-0 flex-1 text-left"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{etiqueta}</p>{editando ? <input autoFocus value={valorEdicion} onChange={(event) => alCambiar(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void alGuardar(); if (event.key === "Escape") alCancelar(); }} className="mt-1 w-full rounded-lg border border-pink-300 px-2 py-1 text-sm font-medium text-slate-900 outline-none ring-2 ring-pink-100" /> : <p className="truncate text-sm font-medium text-slate-900">{valor}</p>}</div>{editando ? <div className="flex shrink-0 items-center gap-1"><button type="button" disabled={guardando} onClick={() => void alGuardar()} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50" aria-label={`Guardar ${etiqueta}`}>{guardando ? <LoaderCircle size={18} className="animate-spin" /> : <Check size={18} />}</button><button type="button" disabled={guardando} onClick={alCancelar} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={`Cancelar edición de ${etiqueta}`}><X size={18} /></button></div> : <button type="button" onClick={() => alEditar(campo)} className="shrink-0 rounded-lg p-2 text-slate-400 opacity-100 transition hover:bg-pink-50 hover:text-pink-600 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100" aria-label={`Editar ${etiqueta}`}><Pencil size={17} /></button>}</div>;
}
