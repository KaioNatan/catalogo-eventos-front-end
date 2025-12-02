import React from "react";
import type { Cidade } from "../../../domain";
import { Button, Modal } from "../../../shared/ui";

interface CidadeFormModalProps {
  open: boolean;
  initialValue: Cidade | null;
  onClose: () => void;
  onSave: (data: Omit<Cidade, "id" | "pontos"> & { id?: string }) => void;
}

export const CidadeFormModal: React.FC<CidadeFormModalProps> = ({
  open,
  initialValue,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const nome = (formData.get("nome") as string).trim();
    const uf = ((formData.get("uf") as string) || "MS").trim().toUpperCase();
    const desc = (formData.get("desc") as string).trim();

    if (!nome) {
      window.alert("Informe pelo menos o nome da cidade.");
      return;
    }

    onSave({
      id: initialValue?.id,
      nome,
      uf,
      desc,
    });
  };

  return (
    <Modal onClose={onClose} className="max-w-xl">
      <div className="mb-4 flex items-center justify-between gap-2">
        <strong className="text-sm md:text-base">
          {initialValue?.id ? "Editar cidade" : "Nova cidade"}
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
            <span>Nome da cidade</span>
            <input
              name="nome"
              defaultValue={initialValue?.nome ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
          <label className="w-24 flex flex-col gap-1">
            <span>UF</span>
            <input
              name="uf"
              maxLength={2}
              defaultValue={initialValue?.uf ?? "MS"}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 uppercase outline-none"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1">
          <span>Descrição</span>
          <textarea
            name="desc"
            rows={3}
            placeholder="Breve descrição da cidade…"
            defaultValue={initialValue?.desc ?? ""}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none resize-none"
          />
        </label>

        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" type="submit">
            Salvar cidade
          </Button>
        </div>
      </form>
    </Modal>
  );
};
