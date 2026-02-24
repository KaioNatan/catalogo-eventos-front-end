// src/bff/appBff.ts
import { api } from "../http/api";
import type { AppState } from "../context/appDataContext";
import type { Evento, Cidade } from "../domain";

// --------- Carga inicial ---------
export async function fetchAppState(): Promise<AppState> {
  const [eventosRes, cidadesRes] = await Promise.all([
    api.get<Evento[]>("/eventos"),
    api.get<Cidade[]>("/cidades"),
  ]);

  return {
    eventos: eventosRes.data,
    cidades: cidadesRes.data,
  };
}

// --------- Eventos ---------

export async function createEventoApi(payload: Evento): Promise<Evento> {
  const response = await api.post<Evento>("/eventos", payload);
  return response.data;
}

export async function updateEventoApi(payload: Evento): Promise<Evento> {
  if (!payload.id) {
    throw new Error("updateEventoApi: evento sem id");
  }
  const response = await api.put<Evento>(`/eventos/${payload.id}`, payload);
  return response.data;
}

export async function deleteEventoApi(id: string): Promise<void> {
  await api.delete(`/eventos/${id}`);
}

// --------- (Cidades – se quiser evoluir depois) ---------

export async function createCidadeApi(payload: Omit<Cidade, "id">): Promise<Cidade> {
  const response = await api.post<Cidade>("/cidades", payload);
  return response.data;
}

export async function updateCidadeApi(payload: Cidade): Promise<Cidade> {
  if (!payload.id) {
    throw new Error("updateCidadeApi: cidade sem id");
  }
  const response = await api.put<Cidade>(`/cidades/${payload.id}`, payload);
  return response.data;
}

export async function deleteCidadeApi(id: string): Promise<void> {
  await api.delete(`/cidades/${id}`);
}
