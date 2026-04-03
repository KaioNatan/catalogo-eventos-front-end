import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";

export function TopNav(): ReactElement {
  const linkBase: string =
    "rounded-xl px-3 py-2 text-sm font-medium transition";
  const linkActive: string = "bg-black/5 text-zinc-900";
  const linkIdle: string = "text-zinc-600 hover:bg-black/5 hover:text-zinc-900";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 py-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:rgba(0,152,201,0.12)]">
            <img
              src="./celeiro_ms_logo.jpg"
              alt="Logo do Celeiro do MS"
              className="h-8 w-8 rounded-full object-cover"
            />
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900">Celeiro do MS</p>
            <p className="text-xs text-zinc-500">Turismo &amp; Eventos</p>
          </div>
        </NavLink>

        <nav
          className="flex w-full items-center gap-1 overflow-x-auto md:w-auto"
          aria-label="Navegação principal"
        >
          <NavLink
            to="/"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/eventos"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Eventos
          </NavLink>

          <NavLink
            to="/pontos-turisticos"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Pontos turísticos
          </NavLink>

          <NavLink
            to="/cidades"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Cidades
          </NavLink>

          <NavLink
            to="/sobre"
            className={({ isActive }: { isActive: boolean }) =>
              `${linkBase} ${isActive ? linkActive : linkIdle}`
            }
          >
            Sobre
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
