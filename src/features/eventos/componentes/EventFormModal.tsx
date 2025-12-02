import React from "react";
import type { Evento } from "../../../domain";
import { Button, Modal } from "../../../shared/ui";

interface EventFormModalProps {
  open: boolean;
  initialValue: Evento | null;
  onClose: () => void;
  onSave: (data: Omit<Evento, "id"> & { id?: string }) => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  open,
  initialValue,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const titulo = (formData.get("titulo") as string).trim();
    const cat = (formData.get("cat") as string) || "Show";
    const data = (formData.get("data") as string) || "";
    const hora = (formData.get("hora") as string) || "";
    const preco = ((formData.get("preco") as string) || "").trim() || "Gratuito";
    const local = (formData.get("local") as string).trim();
    const img = (formData.get("img") as string).trim();
    const desc = (formData.get("desc") as string).trim();

    if (!titulo || !data || !local) {
      window.alert("Preencha ao menos Título, Data e Local.");
      return;
    }

    onSave({
      id: initialValue?.id,
      titulo,
      cat,
      data,
      hora,
      preco,
      local,
      img,
      desc,
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <strong className="text-sm md:text-base">
          {initialValue?.id ? "Editar evento" : "Novo evento"}
        </strong>
        <Button size="sm" onClick={onClose}>
          Fechar
        </Button>
      </div>

      <form
        className="flex flex-col gap-4 text-sm"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span>Título</span>
            <input
              name="titulo"
              defaultValue={initialValue?.titulo ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span>Categoria</span>
            <select
              name="cat"
              defaultValue={initialValue?.cat ?? "Show"}
              className="rounded-xl border border-white/20 bg-slate-800 px-3 py-2 outline-none"
            >
              <option>Show</option>
              <option>Esporte</option>
              <option>Feira</option>
              <option>Teatro</option>
              <option>Gastronomia</option>
            </select>
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span>Data</span>
            <input
              type="date"
              name="data"
              defaultValue={initialValue?.data ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span>Hora</span>
            <input
              type="time"
              name="hora"
              defaultValue={initialValue?.hora ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span>Preço</span>
            <input
              name="preco"
              placeholder="Ex.: Gratuito ou R$ 30,00"
              defaultValue={initialValue?.preco ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span>Local</span>
          <input
            name="local"
            placeholder="Endereço / bairro"
            defaultValue={initialValue?.local ?? ""}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Imagem (URL)</span>
          <input
            name="img"
            placeholder="Cole o link da imagem"
            defaultValue={initialValue?.img ?? ""}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span>Descrição</span>
          <textarea
            name="desc"
            rows={4}
            placeholder="Detalhes do evento…"
            defaultValue={initialValue?.desc ?? ""}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none resize-none"
          />
        </label>

        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" type="submit">
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
