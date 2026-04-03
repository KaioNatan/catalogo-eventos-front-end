import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthProvider } from "../AuthProvider";
import { useAuth } from "../useAuth";

describe("useAuth", () => {
  it("deve expor o contexto quando usado dentro do provider", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(typeof result.current.logout).toBe("function");
  });

  it("deve lançar erro quando usado fora do provider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth deve ser usado dentro de AuthProvider",
    );
  });
});
