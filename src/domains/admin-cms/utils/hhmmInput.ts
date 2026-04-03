function clampInt(n: number, min: number, max: number): number {
  const x = Number.isFinite(n) ? n : 0;
  return Math.min(max, Math.max(min, x));
}

/**
 * Máscara durante a digitação: só dígitos, até 4, formato parcial HH:mm.
 */
export function maskHHmmInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) {
    return "";
  }
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/**
 * Normaliza para `HH:mm` (24h) no blur ou antes de enviar à API.
 */
export function finalizeHHmmString(display: string): string {
  const t = display.trim();
  if (!t) {
    return "";
  }

  if (t.includes(":")) {
    const [hPart, mPart = ""] = t.split(":", 2);
    const hd = hPart.replace(/\D/g, "").slice(0, 2);
    const md = mPart.replace(/\D/g, "").slice(0, 2);
    const h = clampInt(Number(hd || "0"), 0, 23);
    let m = 0;
    if (md.length === 0) {
      m = 0;
    } else if (md.length === 1) {
      m = clampInt(Number(md), 0, 59);
    } else {
      m = clampInt(Number(md.slice(0, 2)), 0, 59);
    }
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  const d = t.replace(/\D/g, "").slice(0, 4);
  if (!d) {
    return "";
  }

  let h: number;
  let m: number;
  if (d.length <= 2) {
    h = clampInt(Number(d), 0, 23);
    m = 0;
  } else if (d.length === 3) {
    h = clampInt(Number(d[0]), 0, 23);
    m = clampInt(Number(d.slice(1)), 0, 59);
  } else {
    h = clampInt(Number(d.slice(0, 2)), 0, 23);
    m = clampInt(Number(d.slice(2, 4)), 0, 59);
  }
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function openingHoursToApi(display: string): string | undefined {
  const v = finalizeHHmmString(display);
  return v === "" ? undefined : v;
}

/** Preenche o formulário só com horário já válido; texto legado vira vazio. */
export function openingHoursFromApiToForm(value: string | undefined): string {
  if (!value?.trim()) {
    return "";
  }
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value.trim()) ? value.trim() : "";
}
