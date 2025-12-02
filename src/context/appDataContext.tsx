import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cidade, Evento, PontoTuristico } from "../domain";

const LS_KEY = "douradosplus-data-v1";

export interface AppState {
  eventos: Evento[];
  cidades: Cidade[];
}

interface AppDataContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;

  // Eventos
  createOrUpdateEvento: (evento: Omit<Evento, "id"> & { id?: string }) => void;
  deleteEvento: (id: string) => void;

  // Cidades
  createOrUpdateCidade: (cidade: Omit<Cidade, "id" | "pontos"> & { id?: string }) => void;
  deleteCidade: (id: string) => void;

  // Pontos por cidade
  createOrUpdatePonto: (
    cidadeId: string,
    ponto: Omit<PontoTuristico, "id"> & { id?: string }
  ) => void;
  deletePonto: (cidadeId: string, pontoId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined
);

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

// Pode reaproveitar o mesmo initialData que já tínhamos
const initialState: AppState = {
  eventos: [],
  cidades: [],
};

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.events && parsed.cidades) {
      return {
        eventos: parsed.events,
        cidades: parsed.cidades,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const AppDataProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(() => {
    if (typeof window === "undefined") return initialState;
    return loadFromStorage() ?? initialState;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        events: state.eventos,
        cidades: state.cidades,
      })
    );
  }, [state]);

  // === Eventos ===
  const createOrUpdateEvento: AppDataContextValue["createOrUpdateEvento"] =
    useCallback((evento) => {
      setState((prev) => {
        const id = evento.id ?? createId();
        const novo: Evento = { ...evento, id };
        const idx = prev.eventos.findIndex((e) => e.id === id);
        let lista: Evento[];
        if (idx >= 0) {
          lista = [...prev.eventos];
          lista[idx] = novo;
        } else {
          lista = [...prev.eventos, novo];
        }
        return { ...prev, eventos: lista };
      });
    }, []);

  const deleteEvento: AppDataContextValue["deleteEvento"] = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        eventos: prev.eventos.filter((e) => e.id !== id),
      }));
    },
    []
  );

  // === Cidades ===
  const createOrUpdateCidade: AppDataContextValue["createOrUpdateCidade"] =
    useCallback((cidade) => {
      setState((prev) => {
        const id = cidade.id ?? createId();
        const existente = prev.cidades.find((c) => c.id === id);
        const nova: Cidade = {
          id,
          nome: cidade.nome,
          uf: cidade.uf || "MS",
          desc: cidade.desc ?? "",
          pontos: existente?.pontos ?? [],
        };

        const idx = prev.cidades.findIndex((c) => c.id === id);
        let lista: Cidade[];
        if (idx >= 0) {
          lista = [...prev.cidades];
          lista[idx] = nova;
        } else {
          lista = [...prev.cidades, nova];
        }
        return { ...prev, cidades: lista };
      });
    }, []);

  const deleteCidade: AppDataContextValue["deleteCidade"] = useCallback(
    (id) => {
      setState((prev) => ({
        ...prev,
        cidades: prev.cidades.filter((c) => c.id !== id),
      }));
    },
    []
  );

  // === Pontos ===
  const createOrUpdatePonto: AppDataContextValue["createOrUpdatePonto"] =
    useCallback((cidadeId, ponto) => {
      setState((prev) => {
        const cidades = prev.cidades.map((c) => {
          if (c.id !== cidadeId) return c;

          const id = ponto.id ?? createId();
          const novo: PontoTuristico = { ...ponto, id };
          const idx = c.pontos.findIndex((p) => p.id === id);
          let pontos: PontoTuristico[];

          if (idx >= 0) {
            pontos = [...c.pontos];
            pontos[idx] = novo;
          } else {
            pontos = [...c.pontos, novo];
          }

          return { ...c, pontos };
        });

        return { ...prev, cidades };
      });
    }, []);

  const deletePonto: AppDataContextValue["deletePonto"] = useCallback(
    (cidadeId, pontoId) => {
      setState((prev) => {
        const cidades = prev.cidades.map((c) => {
          if (c.id !== cidadeId) return c;
          return {
            ...c,
            pontos: c.pontos.filter((p) => p.id !== pontoId),
          };
        });
        return { ...prev, cidades };
      });
    },
    []
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      state,
      setState,
      createOrUpdateEvento,
      deleteEvento,
      createOrUpdateCidade,
      deleteCidade,
      createOrUpdatePonto,
      deletePonto,
    }),
    [
      state,
      createOrUpdateEvento,
      deleteEvento,
      createOrUpdateCidade,
      deleteCidade,
      createOrUpdatePonto,
      deletePonto,
    ]
  );

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData deve ser usado dentro de AppDataProvider");
  }
  return ctx;
}
