import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setupTests.ts",
      css: true,
      include: [
        "src/**/*.spec.ts",
        "src/**/*.test.ts",
        "src/**/*.spec.tsx",
        "src/**/*.test.tsx",
      ],
      coverage: {
        provider: "v8",
        /**
         * Alinhado a práticas comuns em engenharia de software (ex.: foco em linhas/funções
         * para gates de CI; branches costuma ficar mais baixo por condicionais defensivas e UI):
         * - functions: 80% (APIs e fluxos críticos bem exercitados)
         * - lines: 79% | statements: 78% (gate estável para SPA parcialmente coberta por testes)
         * - branches: 68% (condicionais de UI/envelope; subir com o tempo, não bloquear CI)
         * - LCOV: Codecov, SonarQube, GitLab coverage
         * - reportOnFailure: diagnóstico em pipelines mesmo com testes vermelhos
         */
        reporter: ["text", "html", "json-summary", "lcov"],
        reportsDirectory: "./coverage",
        clean: true,
        skipFull: true,
        reportOnFailure: true,
        exclude: [
          "coverage/**",
          "dist/**",
          "**/*.d.ts",
          "**/vite.config.*",
          "**/vitest.config.*",
          "src/test/**",
          "src/main.tsx",
          "src/assets/**",
          "**/*.config.{js,ts,mjs,cjs}",
          "**/*.test.{ts,tsx}",
          "**/*.spec.{ts,tsx}",
          /**
           * Shell de lazy imports: coberto indiretamente por `routes.test.tsx`;
           * testar cada export isoladamente tende a testes frágeis com pouco sinal de regressão.
           */
          "src/app/adminLazyPages.tsx",
        ],
        thresholds: {
          lines: 79,
          functions: 80,
          branches: 68,
          statements: 78,
        },
      },
    },
  }),
);
