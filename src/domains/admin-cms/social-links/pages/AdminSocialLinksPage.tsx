import {
  useMemo,
  useState,
  type ChangeEvent,
  type SyntheticEvent,
  type ReactElement,
} from "react";
import { Button, Card, SectionHeader } from "@/design-system/ui";
import type {
  ICreateSocialLinkInput,
  ISocialLink,
  ISocialLinkBase,
  SocialPlatform,
} from "@/entities/social-link/socialLink.types";
import { useAdminSocialLinksList } from "@/domains/admin-cms/social-links/hooks/useAdminSocialLinksList";
import { adminApiClient } from "@/services/admin-api/client";
import { toApiError } from "@/services/api/apiError";

type ISocialLinkFormState = ISocialLinkBase;

function buildInitialFormState(): ISocialLinkFormState {
  return {
    platform: "instagram",
    label: "",
    url: "",
    active: true,
    order: 1,
  };
}

const PLATFORM_OPTIONS: Array<{
  value: SocialPlatform;
  label: string;
}> = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "site", label: "Site" },
];

export function AdminSocialLinksPage(): ReactElement {
  const {
    items,
    setItems,
    isLoading,
    error: loadError,
  } = useAdminSocialLinksList();
  const [formState, setFormState] = useState<ISocialLinkFormState>(
    buildInitialFormState(),
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  const nextOrder: number = useMemo(() => {
    if (items.length === 0) {
      return 1;
    }

    return Math.max(...items.map((item: ISocialLink) => item.order)) + 1;
  }, [items]);

  function handleInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ): void {
    const { name, value, type } = event.target;

    setFormState((currentState: ISocialLinkFormState) => ({
      ...currentState,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : name === "order"
            ? Number(value)
            : value,
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

      const input: ICreateSocialLinkInput = {
        platform: formState.platform,
        label: formState.label.trim(),
        url: formState.url.trim(),
        active: formState.active,
        order: formState.order,
      };

      const createdItem: ISocialLink =
        await adminApiClient.createSocialLink(input);

      setItems((currentItems: ISocialLink[]) =>
        [...currentItems, createdItem].sort(
          (left: ISocialLink, right: ISocialLink) => left.order - right.order,
        ),
      );

      setFormState({
        ...buildInitialFormState(),
        order: nextOrder + 1,
      });

      setSuccessMessage("Mídia social cadastrada com sucesso.");
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível salvar a mídia social.").message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(item: ISocialLink): Promise<void> {
    try {
      setError("");
      setSuccessMessage("");

      const updatedItem: ISocialLink = await adminApiClient.updateSocialLink({
        id: item.id,
        active: !item.active,
      });

      setItems((currentItems: ISocialLink[]) =>
        currentItems.map((currentItem: ISocialLink) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem,
        ),
      );
    } catch (caught) {
      setError(
        toApiError(
          caught,
          "Não foi possível atualizar o status da mídia social.",
        ).message,
      );
    }
  }

  async function handleDelete(id: number): Promise<void> {
    try {
      setError("");
      setSuccessMessage("");

      await adminApiClient.deleteSocialLink(id);

      setItems((currentItems: ISocialLink[]) =>
        currentItems.filter((item: ISocialLink) => item.id !== id),
      );

      setSuccessMessage("Mídia social removida com sucesso.");
    } catch (caught) {
      setError(
        toApiError(caught, "Não foi possível remover a mídia social.").message,
      );
    }
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="Admin CMS"
        tone="primary"
        description="Gerencie os links de mídias sociais exibidos no portal."
      >
        Mídias sociais
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
        <h2 className="text-lg font-semibold text-zinc-900">
          Novo link social
        </h2>

        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => void handleSubmit(event)}
        >
          <div className="space-y-2">
            <label
              htmlFor="platform"
              className="text-sm font-medium text-zinc-700"
            >
              Plataforma
            </label>
            <select
              id="platform"
              name="platform"
              value={formState.platform}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            >
              {PLATFORM_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="label"
              className="text-sm font-medium text-zinc-700"
            >
              Label
            </label>
            <input
              id="label"
              name="label"
              value={formState.label}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="url" className="text-sm font-medium text-zinc-700">
              URL
            </label>
            <input
              id="url"
              name="url"
              value={formState.url}
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
              Salvar mídia social
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-zinc-900">
          Links cadastrados
        </h2>

        {isLoading ? (
          <p className="mt-4 text-sm text-zinc-600">Carregando dados...</p>
        ) : null}

        {!isLoading && items.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-600">
            Nenhum link social cadastrado.
          </p>
        ) : null}

        {!isLoading && items.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3">Plataforma</th>
                  <th className="py-3">Label</th>
                  <th className="py-3">URL</th>
                  <th className="py-3">Ordem</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: ISocialLink) => (
                  <tr key={item.id} className="border-b border-zinc-100">
                    <td className="py-4">{item.platform}</td>
                    <td className="py-4">{item.label}</td>
                    <td className="py-4">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-primary)] hover:underline"
                      >
                        {item.url}
                      </a>
                    </td>
                    <td className="py-4">{item.order}</td>
                    <td className="py-4">
                      {item.active ? "Ativo" : "Inativo"}
                    </td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => void handleToggleActive(item)}
                        >
                          {item.active ? "Desativar" : "Ativar"}
                        </Button>

                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => void handleDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
