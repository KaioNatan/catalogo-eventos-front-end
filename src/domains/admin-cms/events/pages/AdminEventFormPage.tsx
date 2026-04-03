import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type { ICity } from "@/entities/city/city.types";
import type {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from "@/entities/event/event.types";
import { AdminImageUrlField } from "@/domains/admin-cms/components/AdminImageUrlField";
import {
  EVENT_CATEGORY_OPTIONS,
  EVENT_CATEGORY_VALUES,
} from "@/constants/contentCategories";
import { useAdminEventFormSource } from "@/domains/admin-cms/events/hooks/useAdminEventFormSource";
import { buildFormattedDateRangePtBr } from "@/domains/admin-cms/events/utils/buildFormattedDateRangePtBr";
import { toApiError } from "@/services/api/apiError";
import {
  createAdminEvent,
  updateAdminEvent,
} from "@/services/admin-api/adminEvents.api";

interface IEventFormRouteParams {
  id?: number;
}

interface IEventFormState {
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  formattedDate: string;
  location: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
}

function buildInitialFormState(): IEventFormState {
  return {
    cityId: 0,
    citySlug: "",
    name: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    formattedDate: "",
    location: "",
    imageUrl: "",
    featured: false,
    published: true,
  };
}

function syncFormattedDateFromDateFields(
  state: IEventFormState,
): IEventFormState {
  const { startDate, endDate } = state;
  if (startDate && endDate && startDate <= endDate) {
    return {
      ...state,
      formattedDate: buildFormattedDateRangePtBr(startDate, endDate),
    };
  }
  return {
    ...state,
    formattedDate: "",
  };
}

function mapEventToFormState(event: IEvent): IEventFormState {
  return {
    cityId: event.cityId,
    citySlug: event.citySlug,
    name: event.name,
    description: event.description,
    category: event.category ?? "",
    startDate: event.startDate ?? "",
    endDate: event.endDate ?? "",
    formattedDate: event.formattedDate ?? "",
    location: event.location ?? "",
    imageUrl: event.imageUrl ?? "",
    featured: event.featured,
    published: event.published,
  };
}

export function AdminEventFormPage(): ReactElement {
  const navigate = useNavigate();
  const params = useParams<keyof IEventFormRouteParams>();
  const rawEventId = Number(params.id);
  const eventId: number | undefined =
    Number.isFinite(rawEventId) && rawEventId > 0 ? rawEventId : undefined;

  const isEditMode: boolean = Boolean(eventId);

  const {
    cities,
    event: loadedEvent,
    isLoading,
    error: loadError,
    notFound,
  } = useAdminEventFormSource(eventId);

  const [formState, setFormState] = useState<IEventFormState>(
    buildInitialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (eventId || isLoading || loadedEvent) {
      return;
    }

    const firstCity: ICity | undefined = cities[0];

    if (firstCity) {
      setFormState((currentState: IEventFormState) => ({
        ...currentState,
        cityId: firstCity.id,
        citySlug: firstCity.slug,
      }));
    }
  }, [eventId, isLoading, loadedEvent, cities]);

  useEffect(() => {
    if (!loadedEvent || !eventId) {
      return;
    }

    setFormState(mapEventToFormState(loadedEvent));
  }, [loadedEvent, eventId]);

  const pageTitle: string = useMemo(() => {
    return isEditMode ? "Editar evento" : "Novo evento";
  }, [isEditMode]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value, type } = event.target;

    setFormState((currentState: IEventFormState) => {
      const nextState: IEventFormState = {
        ...currentState,
        [name]:
          type === "checkbox"
            ? (event.target as HTMLInputElement).checked
            : value,
      };

      if (name === "cityId") {
        const selectedCity: ICity | undefined = cities.find(
          (city: ICity) => city.id === Number(value),
        );

        nextState.citySlug = selectedCity?.slug ?? "";
      }

      if (name === "startDate" || name === "endDate") {
        return syncFormattedDateFromDateFields(nextState);
      }

      return nextState;
    });

    if (successMessage) {
      setSuccessMessage("");
    }
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (
      formState.startDate &&
      formState.endDate &&
      formState.startDate > formState.endDate
    ) {
      setError(
        "A data de início não pode ser posterior à data de fim. Ajuste as datas e tente novamente.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      if (isEditMode && eventId) {
        const input: IUpdateEventInput = {
          id: eventId,
          cityId: formState.cityId,
          citySlug: formState.citySlug,
          name: formState.name.trim(),
          description: formState.description.trim(),
          category: formState.category.trim() || undefined,
          startDate: formState.startDate || undefined,
          endDate: formState.endDate || undefined,
          formattedDate: formState.formattedDate.trim() || undefined,
          location: formState.location.trim() || undefined,
          imageUrl: formState.imageUrl.trim() || undefined,
          featured: formState.featured,
          published: formState.published,
        };

        await updateAdminEvent(input);
        setSuccessMessage("Evento atualizado com sucesso.");
      } else {
        const input: ICreateEventInput = {
          cityId: formState.cityId,
          citySlug: formState.citySlug,
          name: formState.name.trim(),
          description: formState.description.trim(),
          category: formState.category.trim() || undefined,
          startDate: formState.startDate || undefined,
          endDate: formState.endDate || undefined,
          formattedDate: formState.formattedDate.trim() || undefined,
          location: formState.location.trim() || undefined,
          imageUrl: formState.imageUrl.trim() || undefined,
          featured: formState.featured,
          published: formState.published,
        };

        await createAdminEvent(input);
        navigate("/admin/eventos", { replace: true });
        return;
      }
    } catch (caught) {
      setError(toApiError(caught).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notFound) {
    return <Navigate to="/admin/eventos" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Carregando evento."
        >
          {pageTitle}
        </SectionHeader>

        <Card>
          <p className="text-sm text-zinc-600">Carregando dados...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Admin CMS"
        tone="primary"
        description="Cadastre ou edite os eventos exibidos no portal."
      >
        {pageTitle}
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

      <form
        className="space-y-6"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Card className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label
              htmlFor="cityId"
              className="text-sm font-medium text-zinc-700"
            >
              Cidade
            </label>
            <select
              id="cityId"
              name="cityId"
              value={formState.cityId}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              {cities.map((city: ICity) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-700">
              Nome
            </label>
            <input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="category"
              className="text-sm font-medium text-zinc-700"
            >
              Categoria
            </label>
            <select
              id="category"
              name="category"
              value={formState.category}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              <option value="">Selecione uma categoria</option>
              {EVENT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {formState.category !== "" &&
              !(EVENT_CATEGORY_VALUES as readonly string[]).includes(
                formState.category,
              ) ? (
                <option value={formState.category}>
                  {formState.category} (valor atual)
                </option>
              ) : null}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="location"
              className="text-sm font-medium text-zinc-700"
            >
              Local
            </label>
            <input
              id="location"
              name="location"
              value={formState.location}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="startDate"
              className="text-sm font-medium text-zinc-700"
            >
              Data início
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formState.startDate}
              max={formState.endDate || undefined}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="endDate"
              className="text-sm font-medium text-zinc-700"
            >
              Data fim
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={formState.endDate}
              min={formState.startDate || undefined}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="formattedDate"
              className="text-sm font-medium text-zinc-700"
            >
              Data formatada
            </label>
            <input
              id="formattedDate"
              name="formattedDate"
              value={formState.formattedDate}
              onChange={handleInputChange}
              placeholder="Ex.: 20 a 22 de março de 2026"
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
              rows={6}
              value={formState.description}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <AdminImageUrlField
            id="imageUrl"
            label="Imagem do evento"
            value={formState.imageUrl}
            disabled={isSubmitting}
            onChange={(next) => {
              setFormState((s) => ({ ...s, imageUrl: next }));
              if (successMessage) {
                setSuccessMessage("");
              }
            }}
          />

          <div className="flex items-center gap-3">
            <input
              id="featured"
              name="featured"
              type="checkbox"
              checked={formState.featured}
              onChange={handleInputChange}
            />
            <label htmlFor="featured" className="text-sm text-zinc-700">
              Destaque
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="published"
              name="published"
              type="checkbox"
              checked={formState.published}
              onChange={handleInputChange}
            />
            <label htmlFor="published" className="text-sm text-zinc-700">
              Publicado
            </label>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/eventos")}
          >
            Voltar
          </Button>

          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Salvar evento
          </Button>
        </div>
      </form>
    </div>
  );
}
