/**
 * A API admin exige `image: { base64, mimeType }` (ver catalogo-eventos-api webImageFileSchema).
 * O formulário usa `imageUrl` string: aceitamos data URLs e, no browser, URLs http(s) baixadas
 * via fetch (requer CORS no host da imagem).
 */

export type IWebImagePayload = {
  base64: string;
  mimeType: string;
  filename?: string;
};

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

function parseDataUrl(
  trimmed: string,
): { mimeType: string; base64: string } | null {
  const match = trimmed.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
  if (!match?.[1] || !match[2]) {
    return null;
  }
  return { mimeType: match[1].toLowerCase(), base64: match[2] };
}

/**
 * Converte o campo imagem (data URL ou URL http(s) com CORS) no payload esperado pela API.
 * Lança antes de qualquer request HTTP ao BFF se o valor for inválido.
 */
export async function resolveWebImagePayloadFromImageUrlField(
  imageUrl: string | undefined,
  fieldLabel: string,
): Promise<IWebImagePayload> {
  const trimmed = imageUrl?.trim() ?? "";
  if (!trimmed) {
    throw new Error(
      `${fieldLabel}: imagem obrigatória. Envie um arquivo (data URL) compatível com a API.`,
    );
  }

  const dataParsed = parseDataUrl(trimmed);
  if (dataParsed) {
    return {
      mimeType: dataParsed.mimeType,
      base64: dataParsed.base64,
      filename: "upload",
    };
  }

  if (/^https?:\/\//i.test(trimmed)) {
    let response: Response;
    try {
      response = await fetch(trimmed, { mode: "cors", credentials: "omit" });
    } catch (err: unknown) {
      const isCorsOrNetwork =
        err instanceof TypeError &&
        /fetch|network|failed|load/i.test(String(err.message));
      const hint = isCorsOrNetwork
        ? " Verifique CORS do servidor da imagem, use data URL ou hospede a imagem no mesmo domínio do app."
        : "";
      throw new Error(
        `${fieldLabel}: não foi possível carregar a URL da imagem.${hint}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `${fieldLabel}: URL da imagem retornou HTTP ${response.status}.`,
      );
    }

    const blob = await response.blob();
    let mimeType = blob.type.split(";")[0]?.trim() ?? "";

    if (!mimeType.startsWith("image/")) {
      if (mimeType === "" || mimeType === "application/octet-stream") {
        mimeType = "image/jpeg";
      } else {
        throw new Error(
          `${fieldLabel}: a URL não retornou uma imagem (Content-Type: ${blob.type || "desconhecido"}). Use data URL ou outra URL.`,
        );
      }
    }

    const buf = await blob.arrayBuffer();
    return {
      mimeType,
      base64: arrayBufferToBase64(buf),
      filename: "upload",
    };
  }

  throw new Error(
    `${fieldLabel}: informe data:image/...;base64,... ou uma URL https:// acessível pelo navegador (CORS).`,
  );
}
