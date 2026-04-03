/**
 * Valida id numérico positivo para fichas do catálogo público (eventos, pontos turísticos, etc.).
 */
export function isValidPublishedCatalogId(
  id: number | undefined,
): id is number {
  return id !== undefined && Number.isFinite(id) && id > 0;
}
