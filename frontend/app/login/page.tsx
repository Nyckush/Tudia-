"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";

const API_URL = "/api/backend";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function iniciarSesion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, contrasena }),
      });
      const cuerpo = (await respuesta.json().catch(() => null)) as { mensaje?: string } | null;

      if (!respuesta.ok) {
        setError(cuerpo?.mensaje ?? "No se pudo iniciar sesión.");
        return;
      }

      localStorage.setItem("tudia.usuario", JSON.stringify(cuerpo));
      router.replace("/dashboard");
    } catch {
      setError("No se pudo conectar con el backend. Verificá que esté iniciado.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat sm:px-4 sm:py-8" style={{ backgroundImage: "url('/fondo.webp')" }}>
      <div aria-hidden className="absolute inset-0 bg-white/20" />
      <form onSubmit={iniciarSesion} className="relative z-10 w-full border border-white/95 bg-white/90 p-6 shadow-[0_24px_65px_rgba(71,85,105,.28),0_8px_22px_rgba(15,23,42,.16)] ring-1 ring-slate-300/45 backdrop-blur-sm sm:max-w-sm sm:rounded-3xl sm:p-8 sm:shadow-[0_32px_80px_rgba(71,85,105,.32),0_12px_30px_rgba(15,23,42,.18)]">
        <div className="flex flex-col items-center text-center">
          <Image src="/logo2.webp" alt="tuDía" width={112} height={112} priority className="size-24 object-contain sm:size-28" />
          <h1 className="mt-5 text-2xl font-semibold text-slate-900">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-slate-600">Usá tu nombre de usuario y contraseña.</p>
        </div>

        <label className="mt-7 block text-sm font-medium text-slate-800" htmlFor="username">Usuario</label>
        <div className="relative mt-1"><UserRound size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-3 pl-10 pr-3 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100" /></div>

        <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor="contrasena">Contraseña</label>
        <div className="relative mt-1"><LockKeyhole size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input id="contrasena" name="contrasena" type="password" autoComplete="current-password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-3 pl-10 pr-3 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-100" /></div>

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={enviando} className="mt-7 w-full rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 px-4 py-3 font-semibold text-white shadow-lg shadow-pink-300/50 transition hover:-translate-y-0.5 hover:brightness-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
