import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import { toIsoDate } from "./toIsoDate";

export function parseInstitutionalValuesJson(valuesJson: unknown): string[] {
  if (typeof valuesJson !== "string" || valuesJson.trim() === "") {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(valuesJson);
    if (Array.isArray(parsed)) {
      return parsed.map((v) => String(v));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function mapInstitutionalFromApi(
  raw: Record<string, unknown>,
): IInstitutionalContent {
  return {
    id: Number(raw.id),
    aboutTitle: String(raw.aboutTitle ?? ""),
    aboutText: String(raw.aboutText ?? ""),
    whoWeAreTitle: String(raw.whoWeAreTitle ?? ""),
    whoWeAreText: String(raw.whoWeAreText ?? ""),
    purposeTitle: String(raw.purposeTitle ?? ""),
    purposeText: String(raw.purposeText ?? ""),
    mission: String(raw.mission ?? ""),
    vision: String(raw.vision ?? ""),
    values: parseInstitutionalValuesJson(raw.valuesJson),
    updatedAt: toIsoDate(raw.updatedAt, new Date(0).toISOString()),
  };
}
