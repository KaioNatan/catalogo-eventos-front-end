import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminImageUrlField } from "../AdminImageUrlField";

describe("AdminImageUrlField", () => {
  it("exibe pré-visualização quando o valor é data URL", () => {
    const dataUrl = "data:image/png;base64,AAAA";
    render(
      <AdminImageUrlField id="imageUrl" value={dataUrl} onChange={vi.fn()} />,
    );

    const preview = screen.getByRole("img", {
      name: /pré-visualização da imagem/i,
    });
    expect(preview).toHaveAttribute("src", dataUrl);
  });

  it("exibe pré-visualização para URL https", () => {
    const url = "https://cdn.example.com/a.png";
    render(<AdminImageUrlField id="imageUrl" value={url} onChange={vi.fn()} />);

    expect(
      screen.getByRole("img", { name: /pré-visualização da imagem/i }),
    ).toHaveAttribute("src", url);
  });

  it("chama onChange ao colar URL no campo de texto", () => {
    const onChange = vi.fn();
    render(<AdminImageUrlField id="imageUrl" value="" onChange={onChange} />);

    fireEvent.change(screen.getByPlaceholderText(/https:\/\/…/i), {
      target: { value: "https://x.test/img.jpg" },
    });

    expect(onChange).toHaveBeenCalledWith("https://x.test/img.jpg");
  });

  it("limpa valor ao clicar em Remover", () => {
    const onChange = vi.fn();
    render(
      <AdminImageUrlField
        id="imageUrl"
        value="https://cdn.example.com/a.png"
        onChange={onChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /remover/i }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
