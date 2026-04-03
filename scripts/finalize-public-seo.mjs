/**
 * Pós-build: grava robots.txt e sitemap.xml em dist/ com URLs absolutas.
 * Exige VITE_PUBLIC_SITE_URL (HTTPS, sem barra final) para sitemap e linha Sitemap no robots.
 *
 * @see docs/operations/fase3-public-delivery-hardening.md
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const baseRaw = process.env.VITE_PUBLIC_SITE_URL?.trim() ?? "";
const base = baseRaw.replace(/\/+$/, "");

/** Rotas públicas estáveis (sem fichas dinâmicas — ver doc Fase 3). */
const STATIC_SITEMAP_PATHS = [
  { route: "/", priority: "1.0", changefreq: "weekly" },
  { route: "/eventos", priority: "0.9", changefreq: "weekly" },
  { route: "/pontos-turisticos", priority: "0.9", changefreq: "weekly" },
  { route: "/sobre", priority: "0.8", changefreq: "monthly" },
];

function main() {
  if (!fs.existsSync(distDir)) {
    console.error(
      "[finalize-public-seo] Pasta dist/ não encontrada. Rode o build antes.",
    );
    process.exit(1);
  }

  const robotsLines = [
    "# Celeiro do MS — área pública indexável; CRM não deve ser rastreado.",
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "",
  ];

  if (base) {
    if (!base.startsWith("https://")) {
      console.warn(
        "[finalize-public-seo] VITE_PUBLIC_SITE_URL deveria ser HTTPS em produção.",
      );
    }
    robotsLines.push(`Sitemap: ${base}/sitemap.xml`, "");
  } else {
    robotsLines.push(
      "# Sitemap: defina VITE_PUBLIC_SITE_URL no build para gerar sitemap.xml e esta linha.",
      "",
    );
  }

  fs.writeFileSync(
    path.join(distDir, "robots.txt"),
    robotsLines.join("\n"),
    "utf8",
  );

  const sitemapPath = path.join(distDir, "sitemap.xml");
  if (base) {
    const lastmod = new Date().toISOString().slice(0, 10);
    const urlEntries = STATIC_SITEMAP_PATHS.map(
      ({ route, priority, changefreq }) => {
        const loc = route === "/" ? `${base}/` : `${base}${route}`;
        return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
      },
    ).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
    fs.writeFileSync(sitemapPath, xml, "utf8");
    console.log("[finalize-public-seo] robots.txt e sitemap.xml atualizados.");
  } else {
    try {
      fs.unlinkSync(sitemapPath);
    } catch {
      /* ok se não existir */
    }
    console.warn(
      "[finalize-public-seo] VITE_PUBLIC_SITE_URL ausente: sitemap.xml não gerado.",
    );
  }
}

main();
