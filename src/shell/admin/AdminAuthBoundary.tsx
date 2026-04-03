import { AuthProvider } from "@/domains/admin-cms/auth/AuthProvider";
import type { ReactElement } from "react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

function AdminRouteFallback(): ReactElement {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center bg-zinc-50 text-sm text-zinc-600"
      role="status"
      aria-live="polite"
    >
      Carregando área administrativa…
    </div>
  );
}

/**
 * Isola Auth CRM e code-splitting do admin: só monta abaixo de `/admin`.
 */
export function AdminAuthBoundary(): ReactElement {
  return (
    <AuthProvider>
      <Suspense fallback={<AdminRouteFallback />}>
        <Outlet />
      </Suspense>
    </AuthProvider>
  );
}
