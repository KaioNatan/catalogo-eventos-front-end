import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminSocialLinksPage } from "../AdminSocialLinksPage";
import { adminApiClient } from "@/services/admin-api/client";

vi.mock("@/services/admin-api/client", () => ({
  adminApiClient: {
    listSocialLinks: vi.fn(),
    createSocialLink: vi.fn(),
    updateSocialLink: vi.fn(),
    deleteSocialLink: vi.fn(),
  },
}));

describe("AdminSocialLinksPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar loading inicial", () => {
    vi.mocked(adminApiClient.listSocialLinks).mockImplementation(
      () => new Promise(() => undefined),
    );

    render(<AdminSocialLinksPage />);

    expect(screen.getByText("Carregando dados...")).toBeInTheDocument();
  });

  it("deve renderizar estado vazio", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([]);

    render(<AdminSocialLinksPage />);

    expect(
      await screen.findByText("Nenhum link social cadastrado."),
    ).toBeInTheDocument();
  });

  it("deve renderizar lista de itens", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com/celeiro",
        active: true,
        order: 1,
      },
    ]);

    render(<AdminSocialLinksPage />);

    expect(
      await screen.findByRole("link", {
        name: "https://instagram.com/celeiro",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Ativo").length).toBeGreaterThanOrEqual(1);
  });

  it("deve criar item com sucesso", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([]);
    vi.mocked(adminApiClient.createSocialLink).mockResolvedValue({
      id: 10,
      platform: "instagram",
      label: "Instagram oficial",
      url: "https://instagram.com/oficial",
      active: true,
      order: 1,
    });

    render(<AdminSocialLinksPage />);

    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Instagram oficial" },
    });

    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://instagram.com/oficial" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /salvar mídia social/i }),
    );

    expect(
      await screen.findByText("Mídia social cadastrada com sucesso."),
    ).toBeInTheDocument();

    expect(screen.getByText("Instagram oficial")).toBeInTheDocument();
  });

  it("deve exibir erro ao falhar no create", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([]);
    vi.mocked(adminApiClient.createSocialLink).mockRejectedValue(
      new Error("erro"),
    );

    render(<AdminSocialLinksPage />);

    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Instagram oficial" },
    });

    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://instagram.com/oficial" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /salvar mídia social/i }),
    );

    expect(await screen.findByText("erro")).toBeInTheDocument();
  });

  it("deve alternar status do item", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com/celeiro",
        active: true,
        order: 1,
      },
    ]);

    vi.mocked(adminApiClient.updateSocialLink).mockResolvedValue({
      id: 1,
      platform: "instagram",
      label: "Instagram",
      url: "https://instagram.com/celeiro",
      active: false,
      order: 1,
    });

    render(<AdminSocialLinksPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Desativar" }));

    await waitFor(() => {
      expect(screen.getByText("Inativo")).toBeInTheDocument();
    });
  });

  it("deve exibir erro ao falhar no toggle", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com/celeiro",
        active: true,
        order: 1,
      },
    ]);

    vi.mocked(adminApiClient.updateSocialLink).mockRejectedValue(
      new Error("erro"),
    );

    render(<AdminSocialLinksPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Desativar" }));

    expect(await screen.findByText("erro")).toBeInTheDocument();
  });

  it("deve excluir item com sucesso", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com/celeiro",
        active: true,
        order: 1,
      },
    ]);

    vi.mocked(adminApiClient.deleteSocialLink).mockResolvedValue(undefined);

    render(<AdminSocialLinksPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));

    expect(
      await screen.findByText("Mídia social removida com sucesso."),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: "https://instagram.com/celeiro" }),
    ).not.toBeInTheDocument();
  });

  it("deve exibir erro ao falhar na exclusão", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([
      {
        id: 1,
        platform: "instagram",
        label: "Instagram",
        url: "https://instagram.com/celeiro",
        active: true,
        order: 1,
      },
    ]);

    vi.mocked(adminApiClient.deleteSocialLink).mockRejectedValue(
      new Error("erro"),
    );

    render(<AdminSocialLinksPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Excluir" }));

    expect(await screen.findByText("erro")).toBeInTheDocument();
  });

  it("deve exibir erro quando falhar o carregamento inicial", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockRejectedValue(
      new Error("erro"),
    );

    render(<AdminSocialLinksPage />);

    expect(
      await screen.findByText("Não foi possível carregar as mídias sociais."),
    ).toBeInTheDocument();
  });

  it("deve limpar mensagem de sucesso ao alterar um campo do formulário", async () => {
    vi.mocked(adminApiClient.listSocialLinks).mockResolvedValue([]);
    vi.mocked(adminApiClient.createSocialLink).mockResolvedValue({
      id: 1,
      platform: "instagram",
      label: "Instagram oficial",
      url: "https://instagram.com/oficial",
      active: true,
      order: 1,
    });

    render(<AdminSocialLinksPage />);

    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Instagram oficial" },
    });

    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://instagram.com/oficial" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /salvar mídia social/i }),
    );

    expect(
      await screen.findByText("Mídia social cadastrada com sucesso."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Label"), {
      target: { value: "Instagram alterado" },
    });

    expect(
      screen.queryByText("Mídia social cadastrada com sucesso."),
    ).not.toBeInTheDocument();
  });
});
