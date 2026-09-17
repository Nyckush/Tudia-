"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavbarPrivadoProps = { children: ReactNode };
type SesionUsuario = { nombre?: string; username?: string; fotoPerfil?: string | null };

export function NavbarPrivado({ children }: NavbarPrivadoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [perfil, setPerfil] = useState<SesionUsuario | null>(null);

  useEffect(() => {
    const actualizarPerfil = () => {
      let sesion: SesionUsuario | null = null;
      try {
        sesion = JSON.parse(localStorage.getItem("tudia.usuario") ?? "null") as SesionUsuario | null;
      } catch {
        sesion = null;
      }
      setPerfil(sesion);
    };
    queueMicrotask(actualizarPerfil);
    window.addEventListener("tudia:usuario-actualizado", actualizarPerfil);
    return () => window.removeEventListener("tudia:usuario-actualizado", actualizarPerfil);
  }, []);

  const inicialPerfil = (() => {
    try {
      const sesion = perfil ?? {};
      return (sesion.nombre ?? sesion.username ?? "U").trim().charAt(0).toUpperCase() || "U";
    } catch {
      return "U";
    }
  })();
  const avatarPerfil = perfil?.fotoPerfil;

  function cerrarSesion() {
    localStorage.removeItem("tudia.usuario");
    router.replace("/login");
  }

  const opciones = [
    { href: "/dashboard", etiqueta: "Mis eventos", activo: pathname === "/dashboard" },
    { href: "/eventos/nuevo", etiqueta: "Crear evento", activo: pathname === "/eventos/nuevo" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="relative mx-auto flex min-h-[4.5rem] w-[92%] flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center"
            aria-label="tuDía: ir a mis eventos"
          >
            <Image
              src="/logo.png"
              alt="tuDía"
              width={144}
              height={58}
              priority
              className="h-11 w-auto sm:h-12"
            />
          </Link>
          <button onClick={() => setAbierto((visible) => !visible)} className="rounded border border-slate-300 px-3 py-1.5 text-base font-medium text-slate-700 sm:hidden">
            Menú
          </button>
          <nav className={`${abierto ? "flex" : "hidden"} order-3 w-full flex-col gap-1 pb-3 sm:absolute sm:left-1/2 sm:top-1/2 sm:flex sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:flex-row sm:items-center sm:gap-2 sm:pb-0`} aria-label="Navegación principal">
            {opciones.map((opcion) => (
              <Link
                key={opcion.href}
                href={opcion.href}
                onClick={() => setAbierto(false)}
                className={`rounded px-3 py-2 text-base font-medium ${opcion.activo ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {opcion.etiqueta}
              </Link>
            ))}
            {pathname.startsWith("/eventos/") && pathname !== "/eventos/nuevo" && <span className="rounded bg-slate-100 px-3 py-2 text-base font-medium text-slate-700">Confirmaciones</span>}
            <div className="mt-2 border-t border-slate-100 pt-2 sm:hidden"><Link href="/perfil" onClick={() => setAbierto(false)} aria-label="Ir a mi perfil" className={`inline-flex w-full items-center gap-2 rounded px-3 py-2 text-base font-medium ${pathname === "/perfil" ? "bg-pink-50 text-slate-900" : "text-slate-700 hover:bg-slate-100"}`}>
              <AvatarPerfil foto={avatarPerfil} inicial={inicialPerfil} />
              Mi perfil
            </Link><button onClick={cerrarSesion} className="mt-1 w-full rounded px-3 py-2 text-left text-base font-medium text-slate-700 hover:bg-slate-100">
              Cerrar sesión
            </button></div>
          </nav>
          <div className="ml-auto hidden items-center gap-2 border-l border-slate-200 pl-3 sm:flex">
            <Link href="/perfil" aria-label="Ir a mi perfil" title="Mi perfil" className={`inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-base font-medium ${pathname === "/perfil" ? "bg-pink-50 text-slate-900" : "text-slate-700 hover:bg-slate-100"}`}>
              <AvatarPerfil foto={avatarPerfil} inicial={inicialPerfil} />
              <span className="max-w-24 truncate">Perfil</span>
            </Link>
            <button onClick={cerrarSesion} className="rounded-lg px-2 py-1.5 text-base font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">Salir</button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

function AvatarPerfil({ foto, inicial }: { foto?: string | null; inicial: string }) {
  return <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 to-orange-400 text-sm font-bold text-white shadow-sm">{foto ? <Image src={foto} alt="Foto de perfil" width={36} height={36} unoptimized className="size-full object-cover" /> : inicial}</span>;
}
