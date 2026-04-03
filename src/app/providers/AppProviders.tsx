import type { PropsWithChildren, ReactElement } from "react";
import { BrowserRouter } from "react-router-dom";

/**
 * Raiz da app: sem Auth CRM — sessão admin só sob `/admin` (`AdminAuthBoundary`).
 */
export function AppProviders({ children }: PropsWithChildren): ReactElement {
  return <BrowserRouter>{children}</BrowserRouter>;
}
