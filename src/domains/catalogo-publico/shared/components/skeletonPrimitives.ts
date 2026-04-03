/**
 * Bloco base para placeholders. `motion-reduce` evita pulsação para quem pede menos movimento (Fase 3 / acessibilidade).
 */
export const skeletonBlockClass: string =
  "rounded bg-zinc-200 motion-safe:animate-pulse motion-reduce:animate-none";
