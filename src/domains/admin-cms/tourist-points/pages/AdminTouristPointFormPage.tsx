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
  ICreateTouristPointInput,
  ITouristPoint,
  IUpdateTouristPointInput,
} from "@/entities/tourist-point/touristPoint.types";
import { AdminImageUrlField } from "@/domains/admin-cms/components/AdminImageUrlField";
import {
  TOURIST_POINT_CATEGORY_OPTIONS,
  TOURIST_POINT_CATEGORY_VALUES,
} from "@/constants/contentCategories";
import { useAdminTouristPointFormSource } from "@/domains/admin-cms/tourist-points/hooks/useAdminTouristPointFormSource";
import {
  finalizeHHmmString,
  maskHHmmInput,
  openingHoursFromApiToForm,
  openingHoursToApi,
} from "@/domains/admin-cms/utils/hhmmInput";
import { adminApiClient } from "@/services/admin-api/client";
import { toApiError } from "@/services/api/apiError";

interface ITouristPointFormRouteParams {
  id?: number;
}

interface ITouristPointFormState {
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category: string;
  address: string;
  openingHours: string;
  imageUrl: string;
  featured: boolean;
  published: boolean;
}

function buildInitialFormState(): ITouristPointFormState {
  return {
    cityId: 0,
    citySlug: "",
    name: "",
    description: "",
    category: "",
    address: "",
    openingHours: "",
    imageUrl: "",
    featured: false,
    published: true,
  };
}

function mapTouristPointToFormState(
  touristPoint: ITouristPoint,
): ITouristPointFormState {
  return {
    cityId: touristPoint.cityId,
    citySlug: touristPoint.citySlug,
    name: touristPoint.name,
    description: touristPoint.description,
    category: touristPoint.category ?? "",
    address: touristPoint.address ?? "",
    openingHours: openingHoursFromApiToForm(touristPoint.openingHours),
    imageUrl: touristPoint.imageUrl ?? "",
    featured: touristPoint.featured,
    published: touristPoint.published,
  };
}

export function AdminTouristPointFormPage(): ReactElement {
  const navigate = useNavigate();
  const params = useParams<keyof ITouristPointFormRouteParams>();
  const rawTouristPointId = Number(params.id);
  const touristPointId: number | undefined =
    Number.isFinite(rawTouristPointId) && rawTouristPointId > 0
      ? rawTouristPointId
      : undefined;

  const isEditMode: boolean = Boolean(touristPointId);

  const {
    cities,
    touristPoint: loadedTouristPoint,
    isLoading,
    error: loadError,
    notFound,
  } = useAdminTouristPointFormSource(touristPointId);

  const [formState, setFormState] = useState<ITouristPointFormState>(
    buildInitialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (touristPointId || isLoading || loadedTouristPoint) {
      return;
    }

    const firstCity: ICity | undefined = cities[0];

    if (firstCity) {
      setFormState((currentState: ITouristPointFormState) => ({
        ...currentState,
        cityId: firstCity.id,
        citySlug: firstCity.slug,
      }));
    }
  }, [touristPointId, isLoading, loadedTouristPoint, cities]);

  useEffect(() => {
    if (!loadedTouristPoint || !touristPointId) {
      return;
    }

    setFormState(mapTouristPointToFormState(loadedTouristPoint));
  }, [loadedTouristPoint, touristPointId]);

  const pageTitle: string = useMemo(() => {
    return isEditMode ? "Editar ponto turístico" : "Novo ponto turístico";
  }, [isEditMode]);

  function handleInputChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void {
    const { name, value, type } = event.target;

    setFormState((currentState: ITouristPointFormState) => {
      const nextState: ITouristPointFormState = {
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

      return nextState;
    });

    if (successMessage) {
      setSuccessMessage("");
    }
  }

  function handleOpeningHoursChange(
    event: ChangeEvent<HTMLInputElement>,
  ): void {
    const masked = maskHHmmInput(event.target.value);
    setFormState((currentState: ITouristPointFormState) => ({
      ...currentState,
      openingHours: masked,
    }));
    if (successMessage) {
      setSuccessMessage("");
    }
  }

  function handleOpeningHoursBlur(): void {
    setFormState((currentState: ITouristPointFormState) => ({
      ...currentState,
      openingHours:
        currentState.openingHours.trim() === ""
          ? ""
          : finalizeHHmmString(currentState.openingHours),
    }));
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      if (isEditMode && touristPointId) {
        const input: IUpdateTouristPointInput = {
          id: touristPointId,
          cityId: formState.cityId,
          citySlug: formState.citySlug,
          name: formState.name.trim(),
          description: formState.description.trim(),
          category: formState.category.trim() || undefined,
          address: formState.address.trim() || undefined,
          openingHours: openingHoursToApi(formState.openingHours),
          imageUrl: formState.imageUrl.trim() || undefined,
          featured: formState.featured,
          published: formState.published,
        };

        await adminApiClient.updateTouristPoint(input);
        setSuccessMessage("Ponto turístico atualizado com sucesso.");
      } else {
        const input: ICreateTouristPointInput = {
          cityId: formState.cityId,
          citySlug: formState.citySlug,
          name: formState.name.trim(),
          description: formState.description.trim(),
          category: formState.category.trim() || undefined,
          address: formState.address.trim() || undefined,
          openingHours: openingHoursToApi(formState.openingHours),
          imageUrl: formState.imageUrl.trim() || undefined,
          featured: formState.featured,
          published: formState.published,
        };

        await adminApiClient.createTouristPoint(input);
        navigate("/admin/pontos-turisticos", { replace: true });
        return;
      }
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível salvar o ponto turístico.")
          .message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (notFound) {
    return <Navigate to="/admin/pontos-turisticos" replace />;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Carregando ponto turístico."
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
        description="Cadastre ou edite os pontos turísticos exibidos no portal."
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
              {TOURIST_POINT_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
              {formState.category !== "" &&
              !(TOURIST_POINT_CATEGORY_VALUES as readonly string[]).includes(
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
              htmlFor="address"
              className="text-sm font-medium text-zinc-700"
            >
              Endereço
            </label>
            <input
              id="address"
              name="address"
              value={formState.address}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label
              htmlFor="openingHours"
              className="text-sm font-medium text-zinc-700"
            >
              Horário de funcionamento
            </label>
            <input
              id="openingHours"
              name="openingHours"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="HH:mm (ex.: 08:30)"
              maxLength={5}
              value={formState.openingHours}
              onChange={handleOpeningHoursChange}
              onBlur={handleOpeningHoursBlur}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
            <p className="text-xs text-zinc-500">
              Envio para a API no formato 24h (HH:mm).
            </p>
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
            label="Imagem do ponto turístico"
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
            onClick={() => navigate("/admin/pontos-turisticos")}
          >
            Voltar
          </Button>

          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Salvar ponto turístico
          </Button>
        </div>
      </form>
    </div>
  );
}
