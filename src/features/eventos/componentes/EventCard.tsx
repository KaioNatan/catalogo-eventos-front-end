import React from "react";
import type { Evento } from "../../../domain";
import { Button, Card } from "../../../shared/ui";

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR", {
    timeZone: "America/Campo_Grande",
  });

interface EventCardProps {
  evento: Evento;
  onEdit: (evento: Evento) => void;
  onDelete: (id: string) => void;
  onDetails: (evento: Evento) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  evento,
  onEdit,
  onDelete,
  onDetails,
}) => {
  return (
    <Card className="overflow-hidden flex flex-col">
      <img
        src={evento.img || ""}
        alt="Imagem do evento"
        className="h-40 w-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src =
            "https://picsum.photos/800/450?blur=2";
        }}
      />
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 font-semibold">
            {evento.cat}
          </span>
          <span className="text-[#9fb0c8]">
            {formatDate(evento.data)} • {evento.hora || ""}
          </span>
        </div>
        <h3 className="text-base font-extrabold">{evento.titulo}</h3>
        <p className="text-xs text-[#9fb0c8]">
          {evento.local} • {evento.preco}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Button size="sm" onClick={() => onDetails(evento)}>
            Detalhes
          </Button>
          <Button size="sm" onClick={() => onEdit(evento)}>
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(evento.id)}
          >
            Excluir
          </Button>
        </div>
      </div>
    </Card>
  );
};
