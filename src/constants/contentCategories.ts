/**
 * Valores exatamente como validados no back-end (case sensitive).
 * Usados no CMS e nos filtros do catálogo público.
 */
export const EVENT_CATEGORY_VALUES = [
  "show",
  "esporte",
  "feira",
  "teatro",
  "gastronomia",
] as const;

export type EventCategoryValue = (typeof EVENT_CATEGORY_VALUES)[number];

export const EVENT_CATEGORY_OPTIONS: {
  value: EventCategoryValue;
  label: string;
}[] = [
  { value: "show", label: "Show" },
  { value: "esporte", label: "Esporte" },
  { value: "feira", label: "Feira" },
  { value: "teatro", label: "Teatro" },
  { value: "gastronomia", label: "Gastronomia" },
];

export const TOURIST_POINT_CATEGORY_VALUES = [
  "parque",
  "praça",
  "museu",
  "igreja",
] as const;

export type TouristPointCategoryValue =
  (typeof TOURIST_POINT_CATEGORY_VALUES)[number];

export const TOURIST_POINT_CATEGORY_OPTIONS: {
  value: TouristPointCategoryValue;
  label: string;
}[] = [
  { value: "parque", label: "Parque" },
  { value: "praça", label: "Praça" },
  { value: "museu", label: "Museu" },
  { value: "igreja", label: "Igreja" },
];

const EVENT_CATEGORY_LABEL_BY_VALUE: Record<string, string> =
  Object.fromEntries(EVENT_CATEGORY_OPTIONS.map((o) => [o.value, o.label]));

const TOURIST_POINT_CATEGORY_LABEL_BY_VALUE: Record<string, string> =
  Object.fromEntries(
    TOURIST_POINT_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
  );

/** Rótulo para exibição pública; se não houver no catálogo, devolve o valor bruto. */
export function labelForEventCategory(
  value: string | undefined | null,
): string {
  if (value == null || value === "") {
    return "";
  }
  return EVENT_CATEGORY_LABEL_BY_VALUE[value] ?? value;
}

export function labelForTouristPointCategory(
  value: string | undefined | null,
): string {
  if (value == null || value === "") {
    return "";
  }
  return TOURIST_POINT_CATEGORY_LABEL_BY_VALUE[value] ?? value;
}
