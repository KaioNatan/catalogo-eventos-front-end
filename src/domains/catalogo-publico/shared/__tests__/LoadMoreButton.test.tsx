import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoadMoreButton } from "../components/LoadMoreButton";

describe("LoadMoreButton", () => {
  it("deve renderizar 'Carregar mais' quando não estiver carregando", () => {
    render(<LoadMoreButton isLoading={false} onClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /carregar mais/i }),
    ).toBeInTheDocument();
  });

  it("deve renderizar 'Carregando...' quando estiver carregando", () => {
    render(<LoadMoreButton isLoading={true} onClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: /carregando/i }),
    ).toBeInTheDocument();
  });

  it("deve chamar onClick ao clicar no botão", () => {
    const onClick = vi.fn();

    render(<LoadMoreButton isLoading={false} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: /carregar mais/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("deve ficar desabilitado quando disabled for true", () => {
    const onClick = vi.fn();

    render(<LoadMoreButton isLoading={false} onClick={onClick} disabled />);

    expect(
      screen.getByRole("button", { name: /carregar mais/i }),
    ).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /carregar mais/i }));

    expect(onClick).not.toHaveBeenCalled();
  });
});
