/**
 * Envelope JSON comum da API (Resource / CollectionResource).
 * Extraído para uso pelo cliente público e admin.
 */
export type ApiListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function unwrapCollection<T>(raw: unknown): {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} {
  if (!isRecord(raw) || !Array.isArray(raw.data)) {
    throw new Error("Resposta de coleção inválida: esperado { data: [] }");
  }
  const meta: ApiListMeta = isRecord(raw.meta) ? (raw.meta as ApiListMeta) : {};
  const page = typeof meta.page === "number" ? meta.page : 1;
  const limit = typeof meta.limit === "number" ? meta.limit : raw.data.length;
  const total = typeof meta.total === "number" ? meta.total : raw.data.length;
  const totalPages =
    typeof meta.totalPages === "number"
      ? meta.totalPages
      : Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    items: raw.data as T[],
    page,
    limit,
    total,
    totalPages,
  };
}

export function unwrapResource<T>(raw: unknown): T {
  if (!isRecord(raw) || !("data" in raw)) {
    throw new Error("Resposta de recurso inválida: esperado { data }");
  }
  return raw.data as T;
}
