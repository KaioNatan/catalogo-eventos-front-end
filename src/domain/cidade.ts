import type { PontoTuristico } from "./pontoTuristico";

export interface Cidade {
  id: string;
  nome: string;
  uf: string;
  desc: string;
  pontos: PontoTuristico[];
}
