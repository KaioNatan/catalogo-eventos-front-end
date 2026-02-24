export type EventoCategoria =
  | "Show"
  | "Esporte"
  | "Feira"
  | "Teatro"
  | "Gastronomia";

// src/domain/evento.ts
export interface Evento {
  id: string;
  titulo: string;
  cat: string;
  data: string;
  hora: string;
  local: string;
  preco: string;
  img: string;
  desc: string;
}

