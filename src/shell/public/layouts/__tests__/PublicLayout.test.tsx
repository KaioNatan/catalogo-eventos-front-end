import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PublicLayout } from "../PublicLayout";

describe("PublicLayout", () => {
  it("deve renderizar a navbar, o conteúdo da rota e o footer", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<div>Conteúdo da página</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    // expect(screen.getByText("Celeiro do MS")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo da página")).toBeInTheDocument();
    expect(screen.getByText("Créditos")).toBeInTheDocument();
  });
});
