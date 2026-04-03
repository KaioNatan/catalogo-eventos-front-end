import { describe, expect, it, vi } from "vitest";
import { resolveWebImagePayloadFromImageUrlField } from "../adminWebImage";

describe("resolveWebImagePayloadFromImageUrlField", () => {
  it("aceita data URL PNG", async () => {
    const payload = await resolveWebImagePayloadFromImageUrlField(
      "data:image/png;base64,AAAA",
      "Campo",
    );
    expect(payload.mimeType).toBe("image/png");
    expect(payload.base64).toBe("AAAA");
  });

  it("rejeita vazio", async () => {
    await expect(
      resolveWebImagePayloadFromImageUrlField(undefined, "Campo"),
    ).rejects.toThrow(/obrigatória/);
  });

  it("baixa https e monta base64 quando fetch retorna imagem", async () => {
    const bytes = new Uint8Array([0xff, 0xd8, 0xff]);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob([bytes], { type: "image/jpeg" })),
      }),
    );

    const payload = await resolveWebImagePayloadFromImageUrlField(
      "https://cdn.example.com/x.jpg",
      "Campo",
    );
    expect(payload.mimeType).toBe("image/jpeg");
    expect(payload.base64.length).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });
});
