var _a, _b;
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
/// <reference types="vitest" />
function viteGtmPlugin(containerId) {
    return {
        name: "vite-gtm",
        transformIndexHtml: function (html) {
            if (!containerId) {
                return html;
            }
            var headSnippet = "\n    <!-- Google Tag Manager -->\n    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\n    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\n    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n    })(window,document,'script','dataLayer','".concat(containerId, "');</script>\n    <!-- End Google Tag Manager -->");
            var bodySnippet = "\n    <!-- Google Tag Manager (noscript) -->\n    <noscript><iframe src=\"https://www.googletagmanager.com/ns.html?id=".concat(containerId, "\"\n    height=\"0\" width=\"0\" style=\"display:none;visibility:hidden\" title=\"Google Tag Manager\"></iframe></noscript>");
            return html
                .replace("<head>", "<head>".concat(headSnippet))
                .replace("<body>", "<body>".concat(bodySnippet));
        },
    };
}
var viteEnvMode = process.env.NODE_ENV === "production" ? "production" : "development";
var loadedEnv = loadEnv(viteEnvMode, process.cwd(), "");
var gtmId = ((_a = process.env.VITE_PUBLIC_GTM_ID) === null || _a === void 0 ? void 0 : _a.trim()) ||
    ((_b = loadedEnv.VITE_PUBLIC_GTM_ID) === null || _b === void 0 ? void 0 : _b.trim());
export default defineConfig({
    plugins: [react(), tailwindcss(), viteGtmPlugin(gtmId)],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
