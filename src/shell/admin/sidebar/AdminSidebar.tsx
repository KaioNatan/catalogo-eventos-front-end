import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";

function getLinkClassName(isActive: boolean): string {
  return [
    "block rounded-xl px-3 py-2 text-sm font-medium transition",
    isActive
      ? "bg-[var(--color-primary)] text-white"
      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900",
  ].join(" ");
}

export function AdminSidebar(): ReactElement {
  return (
    <aside className="w-full border-r border-zinc-200 bg-white p-4 md:w-72">
      <div className="mb-6">
        <p className="text-lg font-bold text-zinc-900">Celeiro do MS</p>
        <p className="text-sm text-zinc-500">Painel administrativo</p>
      </div>

      <nav className="space-y-2" aria-label="Navegação administrativa">
        <NavLink
          to="/admin"
          end
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/admin/institucional"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Institucional
        </NavLink>

        <NavLink
          to="/admin/home/banners"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Home · Banners
        </NavLink>

        <NavLink
          to="/admin/home/destaques"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Home · Destaques
        </NavLink>

        <NavLink
          to="/admin/cidades"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Cidades
        </NavLink>

        <NavLink
          to="/admin/eventos"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Eventos
        </NavLink>

        <NavLink
          to="/admin/pontos-turisticos"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Pontos turísticos
        </NavLink>

        <NavLink
          to="/admin/midias-sociais"
          className={({ isActive }: { isActive: boolean }) =>
            getLinkClassName(isActive)
          }
        >
          Mídias sociais
        </NavLink>
      </nav>
    </aside>
  );
}
