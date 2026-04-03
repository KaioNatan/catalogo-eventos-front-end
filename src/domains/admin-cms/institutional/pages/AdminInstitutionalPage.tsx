import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type {
  ICreateInstitutionalContentInput,
  IInstitutionalContent,
  IUpdateInstitutionalContentInput,
} from "@/entities/institutional/institutional.types";
import { useAdminInstitutionalContent } from "@/domains/admin-cms/institutional/hooks/useAdminInstitutionalContent";
import { adminApiClient } from "@/services/admin-api/client";
import { toApiError } from "@/services/api/apiError";

interface IInstitutionalFormState {
  aboutTitle: string;
  aboutText: string;

  whoWeAreTitle: string;
  whoWeAreText: string;

  purposeTitle: string;
  purposeText: string;

  mission: string;
  vision: string;
  valuesText: string;
}

function buildInitialFormState(): IInstitutionalFormState {
  return {
    aboutTitle: "",
    aboutText: "",

    whoWeAreTitle: "",
    whoWeAreText: "",

    purposeTitle: "",
    purposeText: "",

    mission: "",
    vision: "",
    valuesText: "",
  };
}

function mapContentToFormState(
  content: IInstitutionalContent,
): IInstitutionalFormState {
  return {
    aboutTitle: content.aboutTitle,
    aboutText: content.aboutText,

    whoWeAreTitle: content.whoWeAreTitle,
    whoWeAreText: content.whoWeAreText,

    purposeTitle: content.purposeTitle,
    purposeText: content.purposeText,

    mission: content.mission,
    vision: content.vision,
    valuesText: content.values.join("\n"),
  };
}

function valuesFromFormText(valuesText: string): string[] {
  return valuesText
    .split("\n")
    .map((value: string) => value.trim())
    .filter(Boolean);
}

function mapFormStateToCreate(
  formState: IInstitutionalFormState,
): ICreateInstitutionalContentInput {
  return {
    aboutTitle: formState.aboutTitle.trim(),
    aboutText: formState.aboutText.trim(),

    whoWeAreTitle: formState.whoWeAreTitle.trim(),
    whoWeAreText: formState.whoWeAreText.trim(),

    purposeTitle: formState.purposeTitle.trim(),
    purposeText: formState.purposeText.trim(),

    mission: formState.mission.trim(),
    vision: formState.vision.trim(),
    values: valuesFromFormText(formState.valuesText),
  };
}

function mapFormStateToInput(
  formState: IInstitutionalFormState,
  id: number,
): IUpdateInstitutionalContentInput {
  return {
    id,
    ...mapFormStateToCreate(formState),
  };
}

export function AdminInstitutionalPage(): ReactElement {
  const {
    content,
    setContent,
    isLoading,
    error: loadError,
    reload,
  } = useAdminInstitutionalContent();

  const isCreateMode: boolean = !content;
  const [formState, setFormState] = useState<IInstitutionalFormState>(
    buildInitialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    if (content) {
      setFormState(mapContentToFormState(content));
      return;
    }

    setFormState(buildInitialFormState());
  }, [content]);

  const lastUpdatedLabel: string = useMemo(() => {
    if (!content?.updatedAt) {
      return "";
    }

    return new Date(content.updatedAt).toLocaleString("pt-BR");
  }, [content?.updatedAt]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void {
    const { name, value } = event.target;

    setFormState((currentState: IInstitutionalFormState) => ({
      ...currentState,
      [name]: value,
    }));

    if (successMessage) {
      setSuccessMessage("");
    }
  }

  async function handleSubmit(
    event: SyntheticEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError("");
      setSuccessMessage("");

      if (!content) {
        const created: IInstitutionalContent =
          await adminApiClient.createInstitutionalContent(
            mapFormStateToCreate(formState),
          );
        setContent(created);
        setSuccessMessage("Conteúdo institucional cadastrado com sucesso.");
        return;
      }

      const input: IUpdateInstitutionalContentInput = mapFormStateToInput(
        formState,
        content.id,
      );

      const response: IInstitutionalContent =
        await adminApiClient.updateInstitutionalContent(input);

      setContent(response);
      setSuccessMessage("Conteúdo institucional salvo com sucesso.");
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível salvar o conteúdo institucional.")
          .message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          kicker="Admin CMS"
          tone="primary"
          description="Carregando conteúdo institucional."
        >
          Institucional
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
        description={
          isCreateMode
            ? "Cadastre o único conteúdo institucional do portal. Depois de criado, use esta tela apenas para editar."
            : "Edite os textos institucionais exibidos no portal público (há apenas um registro)."
        }
      >
        Institucional
      </SectionHeader>

      {lastUpdatedLabel ? (
        <p className="text-sm text-zinc-500">
          Última atualização: {lastUpdatedLabel}
        </p>
      ) : null}

      {error || loadError ? (
        <Card className="border border-red-200 bg-red-50">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-red-700">
              {error || loadError}
            </p>
            {loadError ? (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={() => void reload()}
              >
                Tentar novamente
              </Button>
            ) : null}
          </div>
        </Card>
      ) : null}

      {successMessage ? (
        <Card className="border border-emerald-200 bg-emerald-50">
          <p className="text-sm font-medium text-emerald-700">
            {successMessage}
          </p>
        </Card>
      ) : null}

      {isCreateMode && !loadError ? (
        <Card className="border border-sky-200 bg-sky-50">
          <p className="text-sm text-sky-900">
            Nenhum conteúdo institucional cadastrado ainda. Preencha os campos
            abaixo e use <strong>Cadastrar</strong> para criar o único registro.
          </p>
        </Card>
      ) : null}

      <form
        className="space-y-6"
        onSubmit={(event) => void handleSubmit(event)}
      >
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            Sobre o portal
          </h2>

          <div className="space-y-2">
            <label
              htmlFor="aboutTitle"
              className="text-sm font-medium text-zinc-700"
            >
              Título
            </label>
            <input
              id="aboutTitle"
              name="aboutTitle"
              value={formState.aboutTitle}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="aboutText"
              className="text-sm font-medium text-zinc-700"
            >
              Texto
            </label>
            <textarea
              id="aboutText"
              name="aboutText"
              rows={5}
              value={formState.aboutText}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Quem somos</h2>

          <div className="space-y-2">
            <label
              htmlFor="whoWeAreTitle"
              className="text-sm font-medium text-zinc-700"
            >
              Título
            </label>
            <input
              id="whoWeAreTitle"
              name="whoWeAreTitle"
              value={formState.whoWeAreTitle}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="whoWeAreText"
              className="text-sm font-medium text-zinc-700"
            >
              Texto
            </label>
            <textarea
              id="whoWeAreText"
              name="whoWeAreText"
              rows={5}
              value={formState.whoWeAreText}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Propósito</h2>

          <div className="space-y-2">
            <label
              htmlFor="purposeTitle"
              className="text-sm font-medium text-zinc-700"
            >
              Título
            </label>
            <input
              id="purposeTitle"
              name="purposeTitle"
              value={formState.purposeTitle}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="purposeText"
              className="text-sm font-medium text-zinc-700"
            >
              Texto
            </label>
            <textarea
              id="purposeText"
              name="purposeText"
              rows={5}
              value={formState.purposeText}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Missão</h2>

            <div className="space-y-2">
              <label
                htmlFor="mission"
                className="text-sm font-medium text-zinc-700"
              >
                Texto
              </label>
              <textarea
                id="mission"
                name="mission"
                rows={5}
                value={formState.mission}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
          </Card>

          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900">Visão</h2>

            <div className="space-y-2">
              <label
                htmlFor="vision"
                className="text-sm font-medium text-zinc-700"
              >
                Texto
              </label>
              <textarea
                id="vision"
                name="vision"
                rows={5}
                value={formState.vision}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
              />
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Valores</h2>

          <div className="space-y-2">
            <label
              htmlFor="valuesText"
              className="text-sm font-medium text-zinc-700"
            >
              Um valor por linha
            </label>
            <textarea
              id="valuesText"
              name="valuesText"
              rows={6}
              value={formState.valuesText}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isCreateMode
              ? "Cadastrar conteúdo institucional"
              : "Salvar alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}
