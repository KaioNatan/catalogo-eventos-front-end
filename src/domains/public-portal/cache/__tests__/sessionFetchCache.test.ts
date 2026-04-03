import { describe, expect, it, vi } from "vitest";

import {
  clearSessionFetchCache,
  getOrCreateSessionPromise,
} from "../sessionFetchCache";

describe("sessionFetchCache", () => {
  it("deduplica chamadas com a mesma chave", async () => {
    clearSessionFetchCache();
    const factory = vi.fn().mockResolvedValue(42);

    const p1 = getOrCreateSessionPromise("k", factory);
    const p2 = getOrCreateSessionPromise("k", factory);

    expect(p1).toBe(p2);
    expect(await p1).toBe(42);
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("chaves diferentes disparam factories distintas", async () => {
    clearSessionFetchCache();
    const a = vi.fn().mockResolvedValue(1);
    const b = vi.fn().mockResolvedValue(2);

    const r1 = await getOrCreateSessionPromise("a", a);
    const r2 = await getOrCreateSessionPromise("b", b);

    expect(r1).toBe(1);
    expect(r2).toBe(2);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
