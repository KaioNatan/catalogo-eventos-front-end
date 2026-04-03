import {
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type {
  HomeHighlightType,
  ICreateHomeHighlightInput,
  IHomeHighlight,
  IHomeHighlightBase,
} from "@/entities/home-content/homeContent.types";
import { AdminHighlightReferencePick } from "@/domains/admin-cms/components/AdminHighlightReferencePick";
import { AdminImageUrlField } from "@/domains/admin-cms/components/AdminImageUrlField";
import { useAdminHomeHighlights } from "@/domains/admin-cms/home-content/hooks/useAdminHomeHighlights";
import { adminApiClient } from "@/services/admin-api/client";
import { toApiError } from "@/services/api/apiError";

type IHomeHighlightFormState = IHomeHighlightBase;

const HIGHLIGHT_TYPE_OPTIONS: Array<{
  value: HomeHighlightType;
  label: string;
}> = [
  { value: "event", label: "Evento" },
  { value: "tourist-point", label: "Ponto turístico" },
  { value: "custom", label: "Customizado" },
];

function buildInitialFormState(): IHomeHighlightFormState {
  return {
    type: "event",
    referenceId: "",
    title: "",
    description: "",
    cityName: "",
    imageUrl: "",
    ctaUrl: "",
    active: true,
    order: 1,
  };
}

export function AdminHomeHighlightsPage(): ReactElement {
  const {
    items,
    setItems,
    isLoading,
    error: loadError,
  } = useAdminHomeHighlights();
  const [formState, setFormState] = useState<IHomeHighlightFormState>(
    buildInitialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const nextOrder: number = useMemo(() => {
    if (items.length === 0) return 1;
    return Math.max(...items.map((item: IHomeHighlight) => item.order)) + 1;
  }, [items]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value, type } = event.target;

    setFormState((currentState: IHomeHighlightFormState) => {
      const raw: string | number | boolean =
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : name === "order"
            ? Number(value)
            : value;
      const nextState: IHomeHighlightFormState = {
        ...currentState,
        [name]: raw,
      };
      if (name === "type") {
        nextState.referenceId = "";
      }
      return nextState;
    });
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      if (formState.type === "custom") {
        setError(
          'O tipo "Customizado" ainda não está disponível. Escolha Evento ou Ponto turístico.',
        );
        return;
      }

      const refTrim = formState.referenceId?.trim() ?? "";
      if (
        (formState.type === "event" || formState.type === "tourist-point") &&
        (refTrim === "" || !Number.isFinite(Number(refTrim)))
      ) {
        setError(
          "Selecione um evento ou ponto turístico na lista de resultados.",
        );
        return;
      }

      const input: ICreateHomeHighlightInput = {
        type: formState.type,
        referenceId: formState.referenceId?.trim() || undefined,
        title: formState.title.trim(),
        description: formState.description.trim(),
        cityName: formState.cityName?.trim() || undefined,
        imageUrl: formState.imageUrl?.trim() || undefined,
        ctaUrl: formState.ctaUrl?.trim() || undefined,
        active: formState.active,
        order: formState.order,
      };

      const createdItem: IHomeHighlight =
        await adminApiClient.createHomeHighlight(input);

      setItems((currentItems: IHomeHighlight[]) =>
        [...currentItems, createdItem].sort(
          (left: IHomeHighlight, right: IHomeHighlight) =>
            left.order - right.order,
        ),
      );

      setFormState({
        ...buildInitialFormState(),
        order: nextOrder + 1,
      });

      setSuccessMessage("Destaque cadastrado com sucesso.");
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível salvar o destaque.").message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReferenceIdChange(next: string): void {
    setFormState((s) => ({ ...s, referenceId: next }));
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      setError("");
      setSuccessMessage("");

      await adminApiClient.deleteHomeHighlight(id);

      setItems((currentItems: IHomeHighlight[]) =>
        currentItems.filter((item: IHomeHighlight) => item.id !== id),
      );
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível remover o destaque.").message,
      );
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Admin CMS"
        tone="primary"
        description="Gerencie os destaques editoriais da home."
      >
        Destaques da Home
      </SectionHeader>

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm font-medium text-red-700">
            {error || loadError}
          </p>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        </Card>
      ) : null}

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Novo destaque</h2>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium text-zinc-700">
              Tipo
            </label>
            <select
              id="type"
              name="type"
              value={formState.type}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              {HIGHLIGHT_TYPE_OPTIONS.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.value === "custom"}
                >
                  {option.label}
                  {option.value === "custom" ? " (em breve)" : ""}
                </option>
              ))}
            </select>
          </div>

          <AdminHighlightReferencePick
            highlightType={formState.type}
            referenceId={formState.referenceId ?? ""}
            onChangeReferenceId={handleReferenceIdChange}
            disabled={isSubmitting}
          />

          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-zinc-700"
            >
              Título
            </label>
            <input
              id="title"
              name="title"
              value={formState.title}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="cityName"
              className="text-sm font-medium text-zinc-700"
            >
              Cidade
            </label>
            <input
              id="cityName"
              name="cityName"
              value={formState.cityName ?? ""}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-zinc-700"
            >
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formState.description}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <AdminImageUrlField
            id="imageUrl"
            label="Imagem do destaque"
            value={formState.imageUrl ?? ""}
            disabled={isSubmitting}
            onChange={(next) => {
              setFormState((s) => ({ ...s, imageUrl: next }));
              if (successMessage) {
                setSuccessMessage("");
              }
            }}
          />

          <div className="space-y-2">
            <label
              htmlFor="ctaUrl"
              className="text-sm font-medium text-zinc-700"
            >
              CTA URL
            </label>
            <input
              id="ctaUrl"
              name="ctaUrl"
              value={formState.ctaUrl ?? ""}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="order"
              className="text-sm font-medium text-zinc-700"
            >
              Ordem
            </label>
            <input
              id="order"
              name="order"
              type="number"
              min={1}
              value={formState.order}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              id="active"
              name="active"
              type="checkbox"
              checked={formState.active}
              onChange={handleInputChange}
            />
            <label htmlFor="active" className="text-sm text-zinc-700">
              Ativo
            </label>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Salvar destaque
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900">
          Destaques cadastrados
        </h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-zinc-600">Carregando dados...</p>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            Nenhum destaque cadastrado.
          </p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-4 space-y-4">
            {items.map((item: IHomeHighlight) => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-zinc-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {item.description}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {item.type} • ordem {item.order} •{" "}
                      {item.active ? "Ativo" : "Inativo"}
                    </p>
                  </div>

                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => void handleDelete(item.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
