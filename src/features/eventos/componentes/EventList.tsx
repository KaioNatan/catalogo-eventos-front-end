import React from "react";
import type { Evento } from "../../../domain";
import { Button } from "../../../shared/ui";
import { EventCard } from "./EventCard";

interface EventListProps {
  eventos: Evento[];
  onNewEvent: () => void;
  onEditEvent: (evento: Evento) => void;
  onDeleteEvent: (id: string) => void;
  onDetails: (evento: Evento) => void;
}

export const EventList: React.FC<EventListProps> = ({
  eventos,
  onNewEvent,
  onEditEvent,
  onDeleteEvent,
  onDetails,
}) => {
  if (eventos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#9fb0c8] flex flex-col gap-3">
        <span>Nenhum evento encontrado com os filtros atuais.</span>
        <Button variant="primary" size="sm" onClick={onNewEvent}>
          + Cadastrar primeiro evento
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={onNewEvent}>
          + Novo evento
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {eventos.map((ev) => (
          <EventCard
            key={ev.id}
            evento={ev}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
            onDetails={onDetails}
          />
        ))}
      </div>
    </div>
  );
};
