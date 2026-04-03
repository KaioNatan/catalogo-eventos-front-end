import { ADMIN_AUTH_FORBIDDEN_EVENT } from "@/services/admin-api/adminAuthEvents";
import { useEffect, useState, type ReactElement } from "react";

export function AdminForbiddenBanner(): ReactElement | null {
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const onForbidden = (): void => {
      setVisible(true);
    };
    window.addEventListener(ADMIN_AUTH_FORBIDDEN_EVENT, onForbidden);
    return () => {
      window.removeEventListener(ADMIN_AUTH_FORBIDDEN_EVENT, onForbidden);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const id = window.setTimeout(() => {
      setVisible(false);
    }, 10_000);
    return () => {
      window.clearTimeout(id);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      role="alert"
      className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
        <p>
          <span className="font-semibold">Acesso negado.</span> Sua conta não
          tem permissão para esta operação. Se precisar de outro nível de
          acesso, fale com o administrador do sistema.
        </p>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-lg px-2 py-1 font-medium text-amber-900 underline-offset-2 hover:underline"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
