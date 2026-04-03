import { describe, expect, it } from "vitest";
import { normalizeBffApiRootUrl } from "../bffBaseUrlNormalize";

describe("normalizeBffApiRootUrl", () => {
  it("remove /public final para auth e clientes usarem /auth/login e /public/...", () => {
    expect(
      normalizeBffApiRootUrl(
        "http://celeiro-api-dev-alb-1882686111.us-east-1.elb.amazonaws.com/api/public",
      ),
    ).toBe(
      "http://celeiro-api-dev-alb-1882686111.us-east-1.elb.amazonaws.com/api",
    );
  });

  it("remove /admin final e barras extras", () => {
    expect(normalizeBffApiRootUrl("https://x.example.com/api/admin///")).toBe(
      "https://x.example.com/api",
    );
  });

  it("mantém raiz /api quando já correta", () => {
    expect(normalizeBffApiRootUrl("https://x.example.com/api")).toBe(
      "https://x.example.com/api",
    );
  });
});
