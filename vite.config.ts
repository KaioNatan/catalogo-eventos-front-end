import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import type { Plugin } from "vite";
import { defineConfig, loadEnv } from "vite";

/// <reference types="vitest" />

function viteGtmPlugin(containerId: string | undefined): Plugin {
  return {
    name: "vite-gtm",
    transformIndexHtml(html) {
      if (!containerId) {
        return html;
      }

      const headSnippet = `
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${containerId}');</script>
    <!-- End Google Tag Manager -->`;

      const bodySnippet = `
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${containerId}"
    height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`;

      return html
        .replace("<head>", `<head>${headSnippet}`)
        .replace("<body>", `<body>${bodySnippet}`);
    },
  };
}

const viteEnvMode =
  process.env.NODE_ENV === "production" ? "production" : "development";
const loadedEnv = loadEnv(viteEnvMode, process.cwd(), "");
const gtmId =
  process.env.VITE_PUBLIC_GTM_ID?.trim() ||
  loadedEnv.VITE_PUBLIC_GTM_ID?.trim();

export default defineConfig({
  plugins: [react(), tailwindcss(), viteGtmPlugin(gtmId)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
