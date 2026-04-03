import { useContext } from "react";
import { AuthContext } from "./auth.context";
import type { IAuthContextValue } from "./auth.types";

export function useAuth(): IAuthContextValue {
  const context: IAuthContextValue | null = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
