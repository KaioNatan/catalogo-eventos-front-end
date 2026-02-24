// src/context/appDataContext.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Cidade, Evento, PontoTuristico } from "../domain";
import { fetchAppState, createEventoApi, updateEventoApi, deleteEventoApi, deleteCidadeApi, updateCidadeApi, createCidadeApi } from "../bff/appBff";


export interface AppState {
  eventos: Evento[];
  cidades: Cidade[];
}

interface AppDataContextValue {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  loading: boolean;
  error: string | null;

  // Eventos (AGORA assíncronos)
  createOrUpdateEvento: (
    evento: Omit<Evento, "id"> & { id?: string }
  ) => Promise<void>;
  deleteEvento: (id: string) => Promise<void>;

  // Cidades (mantém síncrono, por enquanto só no front)
  createOrUpdateCidade: (
    cidade: Omit<Cidade, "id" | "pontos"> & { id?: string }
  ) => void;
  deleteCidade: (id: string) => void;

  // Pontos
  createOrUpdatePonto: (
    cidadeId: string,
    ponto: Omit<PontoTuristico, "id"> & { id?: string }
  ) => void;
  deletePonto: (cidadeId: string, pontoId: string) => void;
}


const AppDataContext = createContext<AppDataContextValue | undefined>(
  undefined
);

const LS_KEY = "douradosplus-data-v1";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID() as string;
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const emptyState: AppState = {
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
    if (typeof window === "undefined") return emptyState;
    return loadFromStorage() ?? emptyState;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persistência em localStorage
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

  // Carregar da fake API se não tiver nada no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasLocal = loadFromStorage();
    if (hasLocal) return;

    setLoading(true);
    fetchAppState()
      .then((data: AppState) => setState(data))
      .catch((err: unknown) => {
        console.error(err);
        setError("Não foi possível carregar os dados iniciais.");
      })
      .finally(() => setLoading(false));
  }, []);

  // ====== CRUD Eventos (igual antes, só usando setState) ======

  // ====== CRUD Eventos (agora via fake API) ======

  const createOrUpdateEvento: AppDataContextValue["createOrUpdateEvento"] =
    useCallback(async (eventoInput) => {
      setError(null);

      const isUpdate = !!eventoInput.id;
      const id = eventoInput.id ?? createId();

      const payload: Evento = {
        id,
        titulo: eventoInput.titulo,
        cat: eventoInput.cat,
        data: eventoInput.data,
        hora: eventoInput.hora,
        preco: eventoInput.preco,
        local: eventoInput.local,
        img: eventoInput.img,
        desc: eventoInput.desc,
      };

      try {
        let saved: Evento;

        if (isUpdate) {
          saved = await updateEventoApi(payload);
        } else {
          saved = await createEventoApi(payload);
        }

        setState((prev) => {
          const eventos = [...prev.eventos];
          const idx = eventos.findIndex((e) => e.id === saved.id);

          if (idx >= 0) {
            eventos[idx] = saved;
          } else {
            eventos.push(saved);
          }

          return { ...prev, eventos };
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível salvar o evento.");
      }
    }, []);

  const deleteEvento: AppDataContextValue["deleteEvento"] = useCallback(
    async (id) => {
      setError(null);
      try {
        await deleteEventoApi(id);
        setState((prev) => ({
          ...prev,
          eventos: prev.eventos.filter((e) => e.id !== id),
        }));
      } catch (err) {
        console.error(err);
        setError("Não foi possível excluir o evento.");
      }
    },
    []
  );


  // ====== CRUD Cidades ======

  const createOrUpdateCidade: AppDataContextValue["createOrUpdateCidade"] =
    useCallback(async (cidade) => {
      setError(null);
      const isUpdate = !!cidade.id;
      const id = cidade.id ?? createId();

      const existente = state.cidades.find((c) => c.id === id);
      const payload: Cidade = {
        id,
        nome: cidade.nome,
        uf: cidade.uf || "MS",
        desc: cidade.desc ?? "",
        pontos: existente?.pontos ?? [],
      }
      try {
        let saved;

        if (isUpdate) {
          saved = await updateCidadeApi(payload);
        } else {
          saved = await createCidadeApi(payload);
        }
        setState((prev) => {
          const cidades = [...prev.cidades];
          const idx = prev.cidades.findIndex((c) => c.id === id);
          if (idx >= 0) {
            cidades[idx] = saved;
          } else {
            cidades.push(saved);
          }

          return { ...prev, cidades };
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível salvar a cidade.");
      }
    }, []);

  const deleteCidade: AppDataContextValue["deleteCidade"] = useCallback(
    async (id) => {
      await deleteCidadeApi(id)
      setState((prev) => ({
        ...prev,
        cidades: prev.cidades.filter((c) => c.id !== id),
      }));
    },
    []
  );

  // ====== CRUD Pontos ======

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
    async (cidadeId, pontoId) => {
      
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
      loading,
      error,
      createOrUpdateEvento,
      deleteEvento,
      createOrUpdateCidade,
      deleteCidade,
      createOrUpdatePonto,
      deletePonto,
    }),
    [
      state,
      loading,
      error,
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
