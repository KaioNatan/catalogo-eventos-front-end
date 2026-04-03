import type {
  ICreateEventInput,
  IEvent,
  IUpdateEventInput,
} from "@/entities/event/event.types";
import { adminApiClient } from "@/services/admin-api/client";

/** Listagem administrativa de eventos (delega ao cliente HTTP autenticado). */
export function listAdminEvents(): Promise<IEvent[]> {
  return adminApiClient.listEvents();
}

export function getAdminEventById(id: number): Promise<IEvent | null> {
  return adminApiClient.getEventById(id);
}

export function createAdminEvent(input: ICreateEventInput): Promise<IEvent> {
  return adminApiClient.createEvent(input);
}

export function updateAdminEvent(input: IUpdateEventInput): Promise<IEvent> {
  return adminApiClient.updateEvent(input);
}

export function deleteAdminEvent(id: number): Promise<void> {
  return adminApiClient.deleteEvent(id);
}
