import React from "react";
import type { Cidade, PontoTuristico } from "../../../domain";
import { Button, Modal } from "../../../shared/ui";

interface PontoFormModalProps {
  open: boolean;
  initialValue: PontoTuristico | null;
  cidadeId: string | null;
  cidades: Cidade[];
  onClose: () => void;
  onSave: (
    cidadeId: string,
    data: Omit<PontoTuristico, "id"> & { id?: string }
  ) => void;
}

export const PontoFormModal: React.FC<PontoFormModalProps> = ({
  open,
  initialValue,
  cidadeId,
  cidades,
  onClose,
  onSave,
}) => {
  if (!open) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const cidadeIdForm = (formData.get("cidadeId") as string) || cidadeId || "";

    if (!cidadeIdForm) {
      window.alert("Selecione uma cidade para o ponto turístico.");
      return;
    }

    const nome = (formData.get("nome") as string).trim();
    const tipo = (formData.get("tipo") as string).trim();
    const horario = (formData.get("horario") as string).trim();
    const img = (formData.get("img") as string).trim();
    const desc = (formData.get("desc") as string).trim();

    if (!nome) {
      window.alert("Informe pelo menos o nome do ponto turístico.");
      return;
    }

    onSave(cidadeIdForm, {
      id: initialValue?.id,
      nome,
      tipo,
      horario,
      img,
      desc,
    });
  };

  return (
    <Modal onClose={onClose}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <strong className="text-sm md:text-base">
          {initialValue?.id ? "Editar ponto turístico" : "Novo ponto turístico"}
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
            <span>Nome do ponto</span>
            <input
              name="nome"
              defaultValue={initialValue?.nome ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span>Tipo</span>
            <input
              name="tipo"
              placeholder="Ex.: Parque, Museu, Praça…"
              defaultValue={initialValue?.tipo ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <label className="flex-1 flex flex-col gap-1">
            <span>Cidade</span>
            <select
              name="cidadeId"
              defaultValue={cidadeId ?? ""}
              className="rounded-xl border border-white/20 bg-slate-800 px-3 py-2 outline-none"
            >
              <option value="">Selecione…</option>
              {cidades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} - {c.uf}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 flex flex-col gap-1">
            <span>Horário</span>
            <input
              name="horario"
              placeholder="Ex.: Ter–Dom, 9h–17h"
              defaultValue={initialValue?.horario ?? ""}
              className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
            />
          </label>
        </div>

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
            placeholder="Detalhes do ponto turístico…"
            defaultValue={initialValue?.desc ?? ""}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none resize-none"
          />
        </label>

        <div className="mt-2 flex justify-end">
          <Button variant="primary" size="sm" type="submit">
            Salvar ponto
          </Button>
        </div>
      </form>
    </Modal>
  );
};
