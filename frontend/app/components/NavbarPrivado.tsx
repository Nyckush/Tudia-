"use client";

import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type NavbarPrivadoProps = { children: ReactNode };

export function NavbarPrivado({ children }: NavbarPrivadoProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);

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
        <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-3 px-4 sm:px-8">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center"
            aria-label="tuDía: ir a mis eventos"
          >
            <Image
              src="/logo.png"
              alt="tuDía"
              width={126}
              height={50}
              priority
              className="h-10 w-auto sm:h-11"
            />
          </Link>
          <button onClick={() => setAbierto((visible) => !visible)} className="rounded border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 sm:hidden">
            Menú
          </button>
          <nav className={`${abierto ? "flex" : "hidden"} w-full flex-col gap-1 pb-3 sm:flex sm:w-auto sm:flex-row sm:items-center sm:gap-2 sm:pb-0`} aria-label="Navegación principal">
            {opciones.map((opcion) => (
              <Link
                key={opcion.href}
                href={opcion.href}
                onClick={() => setAbierto(false)}
                className={`rounded px-3 py-2 text-sm font-medium ${opcion.activo ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                {opcion.etiqueta}
              </Link>
            ))}
            {pathname.startsWith("/eventos/") && pathname !== "/eventos/nuevo" && <span className="rounded bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">Confirmaciones</span>}
            <button onClick={cerrarSesion} className="rounded px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
