/**
 * Deduplicação leve de pedidos GET públicos na mesma sessão (aba).
 * Evita múltiplos fetch ao montar vários componentes que pedem o mesmo recurso.
 * Limpar em testes com `clearSessionFetchCache()`.
 */
const inflight = new Map<string, Promise<unknown>>();

export function getOrCreateSessionPromise<T>(
  key: string,
  factory: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key);
  if (existing) {
    return existing as Promise<T>;
  }
  const promise = factory();
  inflight.set(key, promise);
  return promise as Promise<T>;
}

export function clearSessionFetchCache(): void {
  inflight.clear();
}
