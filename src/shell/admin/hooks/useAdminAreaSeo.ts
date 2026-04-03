import { useEffect } from "react";

const META_NAME = "robots";
const META_CONTENT = "noindex, nofollow";

/**
 * Marca a área administrativa como não indexável (complementa public/robots.txt).
 */
export function useAdminAreaSeo(): void {
  useEffect(() => {
    const existing: Element | null = document.querySelector(
      `meta[name="${META_NAME}"]`,
    );
    let meta: HTMLMetaElement;
    if (existing instanceof HTMLMetaElement) {
      meta = existing;
    } else {
      meta = document.createElement("meta");
      meta.setAttribute("name", META_NAME);
      document.head.appendChild(meta);
    }
    const previous: string | null = meta.getAttribute("content");
    meta.setAttribute("content", META_CONTENT);
    return () => {
      if (previous === null || previous === "") {
        meta.remove();
      } else {
        meta.setAttribute("content", previous);
      }
    };
  }, []);
}
