import { useMemo } from "react";
import { useAppData } from "../context/appDataContext";
import type { Evento } from "../domain";

export interface EventosFilters {
  search?: string;
  category?: string;
  dateFrom?: string; // formato yyyy-mm-dd
}

/**
 * Hook de domínio para trabalhar com eventos.
 *
 * - Lê eventos do AppDataContext
 * - Ordena por data
 * - Aplica filtros opcionais
 * - Exponde operações de CRUD (via contexto)
 */
export function useEventos(filters?: EventosFilters) {
  const {
    state: { eventos },
    createOrUpdateEvento,
    deleteEvento,
    loading,
    error,
  } = useAppData();

  // Ordena eventos por data (mais antigos primeiro)
  const eventosOrdenados = useMemo(
    () => eventos.slice().sort((a, b) => a.data.localeCompare(b.data)),
    [eventos]
  );

  const eventosFiltrados = useMemo(() => {
    if (!filters) return eventosOrdenados;

    const { search, category, dateFrom } = filters;
    const searchLower = (search ?? "").toLowerCase();

    return eventosOrdenados.filter((ev) => {
      const okCat = !category || ev.cat === category;
      const okData = !dateFrom || ev.data >= dateFrom;
      const txt = `${ev.titulo} ${ev.local} ${ev.cat}`.toLowerCase();
      const okSearch = !searchLower || txt.includes(searchLower);
      return okCat && okData && okSearch;
    });
  }, [eventosOrdenados, filters]);

  // Wrappers só pra dar nomes mais semânticos no domínio
  async function salvarEvento(dados: Omit<Evento, "id"> & { id?: string }) {
    await createOrUpdateEvento(dados);
  }

  async function excluirEvento(id: string) {
    await deleteEvento(id);
  }

  return {
    // dados
    eventos,
    eventosOrdenados,
    eventosFiltrados,

    // status
    loadingEventos: loading,
    errorEventos: error,

    // operações
    salvarEvento,
    excluirEvento,
  };
}
