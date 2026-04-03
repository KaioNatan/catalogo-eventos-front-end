const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long" });

function parseLocalDateFromIso(iso: string): Date {
  const parts = iso.split("-").map((segment: string) => Number(segment));
  const year: number = parts[0] ?? 0;
  const month: number = parts[1] ?? 1;
  const day: number = parts[2] ?? 1;
  return new Date(year, month - 1, day);
}

/**
 * Texto exibido no portal, no estilo do placeholder do admin:
 * "20 a 22 de março de 2026". Entradas em `YYYY-MM-DD` (input type="date").
 */
export function buildFormattedDateRangePtBr(
  startIso: string,
  endIso: string,
): string {
  if (!startIso || !endIso) {
    return "";
  }

  const start: Date = parseLocalDateFromIso(startIso);
  const end: Date = parseLocalDateFromIso(endIso);

  if (end < start) {
    return "";
  }

  const d1: number = start.getDate();
  const d2: number = end.getDate();
  const m1: string = monthFormatter.format(start);
  const m2: string = monthFormatter.format(end);
  const y1: number = start.getFullYear();
  const y2: number = end.getFullYear();

  const sameYear: boolean = y1 === y2;
  const sameMonth: boolean = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    if (d1 === d2) {
      return `${d1} de ${m1} de ${y1}`;
    }
    return `${d1} a ${d2} de ${m1} de ${y1}`;
  }

  if (sameYear) {
    return `${d1} de ${m1} a ${d2} de ${m2} de ${y1}`;
  }

  return `${d1} de ${m1} de ${y1} a ${d2} de ${m2} de ${y2}`;
}
