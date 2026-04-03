/** ISO string segura a partir de valores vindos do JSON da API. */
export function toIsoDate(value: unknown, fallback: string): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}
