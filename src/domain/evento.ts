export type EventoCategoria =
  | "Show"
  | "Esporte"
  | "Feira"
  | "Teatro"
  | "Gastronomia";

export interface Evento {
  id: string;
  titulo: string;
  cat: EventoCategoria | string;
  data: string; // yyyy-mm-dd
  hora: string;
  local: string;
  preco: string;
  img: string;
  desc: string;
}
