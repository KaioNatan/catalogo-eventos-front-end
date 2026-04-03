import type { ReactElement } from "react";
import { useAuth } from "@/domains/admin-cms/auth/useAuth";
import { Button } from "@/design-system/ui";

export function AdminHeader(): ReactElement {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
      <div>
        <p className="text-lg font-semibold text-zinc-900">Admin CMS</p>
        <p className="text-sm text-zinc-500">
          Gestão de conteúdo do Celeiro do MS
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
          <p className="text-xs text-zinc-500">{user?.email}</p>
        </div>

        <Button variant="secondary" size="sm" onClick={logout}>
          Sair
        </Button>
      </div>
    </header>
  );
}
