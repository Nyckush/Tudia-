"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <form onSubmit={iniciarSesion} className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Ingresar a tuDía</h1>
        <p className="mt-1 text-sm text-slate-600">Usá tu nombre de usuario y contraseña.</p>

        <label className="mt-6 block text-sm font-medium text-slate-800" htmlFor="username">Usuario</label>
        <input id="username" name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-700" />

        <label className="mt-4 block text-sm font-medium text-slate-800" htmlFor="contrasena">Contraseña</label>
        <input id="contrasena" name="contrasena" type="password" autoComplete="current-password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} required className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-slate-700" />

        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={enviando} className="mt-6 w-full rounded bg-slate-900 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-60">
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
