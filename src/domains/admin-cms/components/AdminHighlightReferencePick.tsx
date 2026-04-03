import {
  useEffect,
  useState,
  type ChangeEvent,
  type ReactElement,
} from "react";
import { Button } from "@/design-system/ui";
import type { HomeHighlightType } from "@/entities/home-content/homeContent.types";
import type { IEvent } from "@/entities/event/event.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { adminApiClient } from "@/services/admin-api/client";

type PickMode = "event" | "tourist-point" | "idle";

export interface IAdminHighlightReferencePickProps {
  highlightType: HomeHighlightType;
  referenceId: string;
  onChangeReferenceId: (next: string) => void;
  disabled?: boolean;
}

export function AdminHighlightReferencePick(
  props: IAdminHighlightReferencePickProps,
): ReactElement {
  const { highlightType, referenceId, onChangeReferenceId, disabled } = props;

  const mode: PickMode =
    highlightType === "event"
      ? "event"
      : highlightType === "tourist-point"
        ? "tourist-point"
        : "idle";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);
  const debouncedCategory = useDebouncedValue(category, 350);

  const [events, setEvents] = useState<IEvent[]>([]);
  const [points, setPoints] = useState<ITouristPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [selectedLabel, setSelectedLabel] = useState("");

  useEffect(() => {
    setSearch("");
    setCategory("");
  }, [mode]);

  useEffect(() => {
    if (mode === "idle" || disabled) {
      setEvents([]);
      setPoints([]);
      return;
    }

    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      setFetchError("");
      try {
        const q = {
          search: debouncedSearch.trim() || undefined,
          category: debouncedCategory.trim() || undefined,
          page: 1,
          limit: 30,
        };
        if (mode === "event") {
          const rows = await adminApiClient.listEventsForPick(q);
          if (!cancelled) {
            setEvents(rows);
            setPoints([]);
          }
        } else {
          const rows = await adminApiClient.listTouristPointsForPick(q);
          if (!cancelled) {
            setPoints(rows);
            setEvents([]);
          }
        }
      } catch {
        if (!cancelled) {
          setFetchError("Não foi possível carregar a lista.");
          setEvents([]);
          setPoints([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [mode, disabled, debouncedSearch, debouncedCategory]);

  useEffect(() => {
    if (mode === "idle" || !referenceId.trim()) {
      setSelectedLabel("");
      return;
    }
    const id = Number(referenceId);
    if (!Number.isFinite(id)) {
      setSelectedLabel("");
      return;
    }

    let cancelled = false;

    async function resolveLabel(): Promise<void> {
      try {
        if (mode === "event") {
          const e = await adminApiClient.getEventById(id);
          if (!cancelled && e) {
            setSelectedLabel(`${e.name} (id ${e.id})`);
          } else if (!cancelled) {
            setSelectedLabel(`Evento id ${referenceId}`);
          }
        } else {
          const p = await adminApiClient.getTouristPointById(id);
          if (!cancelled && p) {
            setSelectedLabel(`${p.name} (id ${p.id})`);
          } else if (!cancelled) {
            setSelectedLabel(`Ponto turístico id ${referenceId}`);
          }
        }
      } catch {
        if (!cancelled) {
          setSelectedLabel(`id ${referenceId}`);
        }
      }
    }

    void resolveLabel();
    return () => {
      cancelled = true;
    };
  }, [mode, referenceId]);

  function handlePick(id: number, label: string): void {
    onChangeReferenceId(String(id));
    setSelectedLabel(label);
  }

  function handleClear(): void {
    onChangeReferenceId("");
    setSelectedLabel("");
  }

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    setSearch(event.target.value);
  }

  function handleCategoryChange(event: ChangeEvent<HTMLInputElement>): void {
    setCategory(event.target.value);
  }

  if (mode === "idle") {
    return (
      <div className="space-y-2 md:col-span-2">
        <span className="text-sm font-medium text-zinc-700">
          Registro vinculado (referenceId)
        </span>
        <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-600">
          O tipo &quot;Customizado&quot; está desabilitado por enquanto. Escolha
          &quot;Evento&quot; ou &quot;Ponto turístico&quot; para buscar e
          vincular um item.
        </p>
      </div>
    );
  }

  const rows: Array<{ id: number; label: string }> =
    mode === "event"
      ? events.map((e: IEvent) => ({
          id: e.id,
          label: `${e.name}${e.category ? ` · ${e.category}` : ""}`,
        }))
      : points.map((p: ITouristPoint) => ({
          id: p.id,
          label: `${p.name}${p.category ? ` · ${p.category}` : ""}`,
        }));

  const kindLabel: string = mode === "event" ? "evento" : "ponto turístico";

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-zinc-700">
          Vincular {kindLabel}
        </span>
        <p className="text-xs text-zinc-500">
          Digite parte do nome e/ou categoria; a busca no servidor usa debounce
          (~350 ms) para não sobrecarregar a API.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label
            htmlFor="ref-pick-search"
            className="text-xs font-medium text-zinc-600"
          >
            Nome (busca)
          </label>
          <input
            id="ref-pick-search"
            type="search"
            value={search}
            onChange={handleSearchChange}
            disabled={disabled}
            autoComplete="off"
            placeholder="Ex.: festival, feira…"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="ref-pick-category"
            className="text-xs font-medium text-zinc-600"
          >
            Categoria (filtro)
          </label>
          <input
            id="ref-pick-category"
            type="text"
            value={category}
            onChange={handleCategoryChange}
            disabled={disabled}
            autoComplete="off"
            placeholder="Opcional"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-[var(--color-primary)]"
          />
        </div>
      </div>

      {referenceId.trim() !== "" ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <p className="text-sm text-emerald-900">
            <span className="font-medium">Selecionado:</span>{" "}
            {selectedLabel || `id ${referenceId}`}
          </p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled}
            onClick={handleClear}
          >
            Limpar seleção
          </Button>
        </div>
      ) : null}

      {fetchError ? (
        <p className="text-sm text-red-600" role="alert">
          {fetchError}
        </p>
      ) : null}

      <div className="rounded-xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-3 py-2 text-xs font-medium text-zinc-500">
          {loading ? "Buscando…" : `Resultados (${rows.length})`}
        </div>
        <ul className="max-h-56 divide-y divide-zinc-100 overflow-y-auto">
          {rows.length === 0 && !loading ? (
            <li className="px-3 py-4 text-sm text-zinc-500">
              Nenhum resultado. Ajuste nome ou categoria.
            </li>
          ) : null}
          {rows.map((row) => (
            <li key={`${mode}-${row.id}`}>
              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  handlePick(row.id, `${row.label} (id ${row.id})`)
                }
                className="w-full px-3 py-2.5 text-left text-sm text-zinc-800 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                {row.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
