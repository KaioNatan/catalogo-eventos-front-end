import { useEffect } from "react";
import { getPublicSiteBaseUrl } from "./siteBaseUrl";

export interface IPublicPageMetadataOptions {
  title: string;
  description?: string;
  /** Path absoluto da app, ex. "/eventos" ou "/eventos/42" — gera canonical se houver site base. */
  canonicalPath?: string;
  /** Evita indexação (ex.: 404 público); remove a meta ao desmontar. */
  noIndex?: boolean;
}

const DEFAULT_DESCRIPTION =
  "Celeiro do MS — eventos, pontos turísticos e experiências da região.";

function upsertMetaDescription(content: string): void {
  let el = document.querySelector('meta[name="description"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "description");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeCanonical(): void {
  document.querySelector('link[rel="canonical"]')?.remove();
}

function upsertRobots(content: string): void {
  let el = document.querySelector('meta[name="robots"]');
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", "robots");
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function removeRobotsMeta(): void {
  document.querySelector('meta[name="robots"]')?.remove();
}

/**
 * Atualiza title, meta description e (opcional) canonical para rotas públicas.
 * Restaura o título anterior ao desmontar; description volta ao default do index.
 */
export function usePublicPageMetadata(
  options: IPublicPageMetadataOptions,
): void {
  const { title, description, canonicalPath, noIndex } = options;

  useEffect(() => {
    const previousTitle = document.title;
    const previousDescription =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ?? DEFAULT_DESCRIPTION;

    document.title = title;
    upsertMetaDescription(description ?? DEFAULT_DESCRIPTION);

    const base = getPublicSiteBaseUrl();
    if (canonicalPath !== undefined && base) {
      const path = canonicalPath.startsWith("/")
        ? canonicalPath
        : `/${canonicalPath}`;
      const url = path === "/" ? `${base}/` : `${base}${path}`;
      upsertCanonical(url);
    } else {
      removeCanonical();
    }

    if (noIndex) {
      upsertRobots("noindex, nofollow");
    }

    return () => {
      document.title = previousTitle;
      upsertMetaDescription(previousDescription);
      removeCanonical();
      if (noIndex) {
        removeRobotsMeta();
      }
    };
  }, [title, description, canonicalPath, noIndex]);
}
