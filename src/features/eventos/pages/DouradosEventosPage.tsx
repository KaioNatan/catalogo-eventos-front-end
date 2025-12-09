import React, { useMemo, useState } from "react";
import { useAppData } from "../../../context/appDataContext";
import type { Cidade, Evento, PontoTuristico } from "../../../domain";
import Header from "../componentes/Header";
import SideBar from "../componentes/SideBar";
import { Button, Card } from "../../../shared/ui";
import { EventFilters } from "../componentes/EventFilters";
import { EventList } from "../componentes/EventList";
import { TourismSection } from "../componentes/TourismSection";
import { CitiesSection } from "../componentes/CitiesSection";
import { EventFormModal } from "../componentes/EventFormModal";
import { CidadeFormModal } from "../componentes/CidadeFormModal";
import { PontoFormModal } from "../componentes/PontoFormModal";

type Tab = "eventos" | "turismo" | "cidades";

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR", {
    timeZone: "America/Campo_Grande",
  });

export const DouradosEventosPage: React.FC = () => {
  const {
    state: { eventos, cidades },
    createOrUpdateEvento,
    deleteEvento,
    createOrUpdateCidade,
    deleteCidade,
    createOrUpdatePonto,
    deletePonto,
  } = useAppData();

  const [tab, setTab] = useState<Tab>("eventos");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // filtros de eventos
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [dataMin, setDataMin] = useState("");

  // turismo
  const [cidadeSelecionadaId, setCidadeSelecionadaId] = useState<string | null>(
    () => cidades[0]?.id ?? null
  );
  const [buscaPonto, setBuscaPonto] = useState("");

  // modais
  const [eventoEdit, setEventoEdit] = useState<Evento | null>(null);
  const [cidadeEdit, setCidadeEdit] = useState<Cidade | null>(null);
  const [pontoEdit, setPontoEdit] = useState<PontoTuristico | null>(null);
  const [pontoCidadeId, setPontoCidadeId] = useState<string | null>(null);

  const handleSideMenuOpen = () => {
    setIsSideMenuOpen((prev) => !prev);
  };

  const handleShowFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const eventosFiltrados = useMemo(
    () =>
      eventos
        .slice()
        .sort((a, b) => a.data.localeCompare(b.data))
        .filter((ev) => {
          const okCat = !cat || ev.cat === cat;
          const okData = !dataMin || ev.data >= dataMin;
          const txt = `${ev.titulo} ${ev.local} ${ev.cat}`.toLowerCase();
          const okQ = !search || txt.includes(search.toLowerCase());
          return okCat && okData && okQ;
        }),
    [eventos, cat, dataMin, search]
  );

  const cidadeSelecionada =
    cidades.find((c) => c.id === cidadeSelecionadaId) ?? cidades[0];

  const pontosFiltrados = useMemo(() => {
    if (!cidadeSelecionada) return [];
    const q = buscaPonto.toLowerCase();
    return cidadeSelecionada.pontos.filter((p) =>
      `${p.nome} ${p.tipo}`.toLowerCase().includes(q)
    );
  }, [buscaPonto, cidadeSelecionada]);

  // === callbacks de CRUD usando o context ===

  const handleSalvarEvento = (dados: Omit<Evento, "id"> & { id?: string }) => {
    createOrUpdateEvento(dados);
    setEventoEdit(null);
  };

  const handleExcluirEvento = (id: string) => {
    if (!window.confirm("Excluir este evento?")) return;
    deleteEvento(id);
  };

  const handleSalvarCidade = (
    dados: Omit<Cidade, "id" | "pontos"> & { id?: string }
  ) => {
    createOrUpdateCidade(dados);
    setCidadeEdit(null);
  };

  const handleExcluirCidade = (id: string) => {
    if (!window.confirm("Excluir esta cidade e todos os seus pontos?")) return;
    deleteCidade(id);
    if (cidadeSelecionadaId === id) {
      const nova = cidades.find((c) => c.id !== id);
      setCidadeSelecionadaId(nova?.id ?? null);
    }
  };

  const handleSalvarPonto = (
    cidadeId: string,
    dados: Omit<PontoTuristico, "id"> & { id?: string }
  ) => {
    createOrUpdatePonto(cidadeId, dados);
    setPontoEdit(null);
    setPontoCidadeId(null);
  };

  const handleExcluirPonto = (cidadeId: string, pontoId: string) => {
    if (!window.confirm("Excluir este ponto turístico?")) return;
    deletePonto(cidadeId, pontoId);
  };

  const handleDetalhesEvento = (ev: Evento) => {
    window.alert(
      `${ev.titulo}
${formatDate(ev.data)} ${ev.hora || ""}
${ev.local}
${ev.preco}

${ev.desc}`
    );
  };

  // === UI ===

  return (
    <div className="min-h-screen text-[#e9f2ff] bg-slate-950">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-slate-900 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg"
      >
        Ir para o conteúdo
      </a>
      {/* overlay do menu lateral */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={handleSideMenuOpen}
        />
      )}

      <SideBar
        open={isSideMenuOpen}
        handleSideMenuOpen={handleSideMenuOpen}
        handleActiveTab={(value) => {
          setTab(value as Tab);
          setIsSideMenuOpen(false);
        }}
      />

      <Header
        open={isSideMenuOpen}
        handleSideMenuOpen={handleSideMenuOpen}
        handleShowFilters={handleShowFilters}
      />

      {/* filtros de eventos */}
      {showFilters && (
        <section className="border-b border-white/10 bg-slate-900/80">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <Card className="p-4">
              <EventFilters
                search={search}
                onSearchChange={setSearch}
                category={cat}
                onCategoryChange={setCat}
                dateFrom={dataMin}
                onDateFromChange={setDataMin}
                onClear={() => {
                  setSearch("");
                  setCat("");
                  setDataMin("");
                }}
                onNewEvent={() => setEventoEdit({} as Evento)}
              />
            </Card>
          </div>
        </section>
      )}

      <main
        id="conteudo-principal"
        className="max-w-5xl mx-auto px-4 pb-16 pt-8"
      >
        {/* hero */}
        <section className="flex flex-col items-center justify-center text-center mb-8">
          <Card className="w-full max-w-3xl p-6 relative overflow-hidden">
            <p className="text-xs tracking-[0.2em] uppercase text-[#9fb0c8] font-semibold">
              Agenda &amp; Guia • Dourados/MS
            </p>
            <h1 className="mt-2 mb-3 text-2xl md:text-3xl font-extrabold">
              Descubra o que rola na cidade e explore o melhor do turismo local.
            </h1>
            <p className="text-sm md:text-base text-[#cfe0fb] leading-relaxed">
              Uma plataforma simples e poderosa para divulgar{" "}
              <strong>eventos</strong>, conhecer{" "}
              <strong>pontos turísticos</strong> e cadastrar informações de{" "}
              <strong>cidades da região</strong>.
            </p>
          </Card>
        </section>

        {/* tabs */}
        <div
          className="mb-6 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Seções Principais"
        >
          <Button
            role="tab"
            aria-selected={tab === "eventos"}
            aria-controls="painel-eventos"
            variant={tab === "eventos" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTab("eventos")}
          >
            Eventos
          </Button>
          <Button
            role="tab"
            aria-selected={tab === "turismo"}
            aria-controls="painel-turismo"
            variant={tab === "turismo" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTab("turismo")}
          >
            Turismo
          </Button>
          <Button
            role="tab"
            aria-selected={tab === "cidades"}
            aria-controls="painel-cidades"
            variant={tab === "cidades" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setTab("cidades")}
          >
            Cidades
          </Button>
        </div>

        {/* painéis */}
        {tab === "eventos" && (
          <section
            id="painel-eventos"
            role="tabpanel"
            aria-labelledby="tab-eventos"
          >
            <EventList
              eventos={eventosFiltrados}
              onNewEvent={() => setEventoEdit({} as Evento)}
              onEditEvent={setEventoEdit}
              onDeleteEvent={handleExcluirEvento}
              onDetails={handleDetalhesEvento}
            />
          </section>
        )}

        {tab === "turismo" && (
          <section
            id="painel-turismo"
            role="tabpanel"
            aria-labelledby="tab-turismo"
          >
            <TourismSection
              cidades={cidades}
              cidadeSelecionada={cidadeSelecionada ?? null}
              cidadeSelecionadaId={cidadeSelecionadaId}
              onCidadeSelecionadaChange={setCidadeSelecionadaId}
              buscaPonto={buscaPonto}
              onBuscaPontoChange={setBuscaPonto}
              pontosFiltrados={pontosFiltrados}
              onNovoPonto={() => {
                if (!cidadeSelecionada) {
                  window.alert("Selecione uma cidade primeiro.");
                  return;
                }
                setPontoCidadeId(cidadeSelecionada.id);
                setPontoEdit({} as PontoTuristico);
              }}
              onEditarCidade={(cidade) => setCidadeEdit(cidade)}
              onEditarPonto={(ponto) => {
                if (!cidadeSelecionada) return;
                setPontoCidadeId(cidadeSelecionada.id);
                setPontoEdit(ponto);
              }}
              onExcluirPonto={(pontoId) => {
                if (!cidadeSelecionada) return;
                handleExcluirPonto(cidadeSelecionada.id, pontoId);
              }}
              onIrParaCidades={() => setTab("cidades")}
            />
          </section>
        )}

        {tab === "cidades" && (
          <section
            id="painel-cidades"
            role="tabpanel"
            aria-labelledby="tab-cidades"
          >
            <CitiesSection
              cidades={cidades}
              onNovaCidade={() => setCidadeEdit({} as Cidade)}
              onVerPontos={(cidadeId) => {
                setCidadeSelecionadaId(cidadeId);
                setTab("turismo");
              }}
              onEditarCidade={(cidade) => setCidadeEdit(cidade)}
              onExcluirCidade={handleExcluirCidade}
            />
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#9fb0c8]">
        Dourados+ • Projeto Inovador • Turma 2024.45.253 • Senac-MS.
      </footer>

      {/* modais */}
      <EventFormModal
        open={!!eventoEdit}
        initialValue={eventoEdit}
        onClose={() => setEventoEdit(null)}
        onSave={handleSalvarEvento}
      />

      <CidadeFormModal
        open={!!cidadeEdit}
        initialValue={cidadeEdit}
        onClose={() => setCidadeEdit(null)}
        onSave={handleSalvarCidade}
      />

      <PontoFormModal
        open={!!pontoEdit}
        initialValue={pontoEdit}
        cidadeId={pontoCidadeId}
        cidades={cidades}
        onClose={() => {
          setPontoEdit(null);
          setPontoCidadeId(null);
        }}
        onSave={handleSalvarPonto}
      />
    </div>
  );
};
