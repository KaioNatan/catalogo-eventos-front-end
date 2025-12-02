import React from "react";
import { Button } from "../../../shared/ui";

interface EventFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  onClear: () => void;
  onNewEvent: () => void;
}

export const EventFilters: React.FC<EventFiltersProps> = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  dateFrom,
  onDateFromChange,
  onClear,
  onNewEvent,
}) => {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-[#9fb0c8] font-semibold mb-3">
        Busca Rápida
      </p>

      <div className="flex flex-col md:flex-row gap-3 mb-3">
        <label className="flex-1 text-sm flex flex-col gap-1">
          <span>Pesquisar</span>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm outline-none"
            placeholder="Busque por título, local, categoria…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>

        <label className="flex-1 text-sm flex flex-col gap-1">
          <span>Categoria</span>
          <select
            className="w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm outline-none"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="">Todas</option>
            <option>Show</option>
            <option>Esporte</option>
            <option>Feira</option>
            <option>Teatro</option>
            <option>Gastronomia</option>
          </select>
        </label>

        <label className="flex-1 text-sm flex flex-col gap-1">
          <span>A partir de</span>
          <input
            type="date"
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm outline-none"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onClear}>
          Limpar
        </Button>
        <Button variant="primary" size="sm" onClick={onNewEvent}>
          + Novo evento
        </Button>
      </div>
    </div>
  );
};
