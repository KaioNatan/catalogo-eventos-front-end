// src/pages/DouradosPlusPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import SideBar from "../componentes/sideBar";

type Evento = {
  id: string;
  titulo: string;
  cat: string;
  data: string; // yyyy-mm-dd
  hora: string;
  local: string;
  preco: string;
  img: string;
  desc: string;
};

type Ponto = {
  id: string;
  nome: string;
  tipo: string;
  horario: string;
  img: string;
  desc: string;
};

type Cidade = {
  id: string;
  nome: string;
  uf: string;
  desc: string;
  pontos: Ponto[];
};

type AppState = {
  eventos: Evento[];
  cidades: Cidade[];
};

const LS_KEY = "douradosplus-data-v1";

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const initialData: AppState = {
  eventos: [
    {
      id: createId(),
      titulo: "Festival Gastronômico do Centro",
      cat: "Gastronomia",
      data: "2025-09-20",
      hora: "18:00",
      local: "Rua Ponciano, Centro",
      preco: "Gratuito",
      img: "https://douradosagora.com.br/media/posts/390241/dourados-tera-neste-sabado-balaio-festival-com-musica-arte-gastronomia-e-cultura-17522582977313.jpg",
      desc: "Barracas, food trucks e música ao vivo com artistas locais.",
    },
    {
      id: createId(),
      titulo: "Corrida Parque dos Ipês 10K",
      cat: "Esporte",
      data: "2025-10-12",
      hora: "07:00",
      local: "Parque dos Ipês",
      preco: "R$ 60,00",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKCBFrpCyTBRz1fdPn65X0mJz6rSRHXCS8tw&s",
      desc: "Prova de 5K e 10K com kit do atleta e medalha de participação.",
    },
    {
      id: createId(),
      titulo: "Japão Fest",
      cat: "Gastronomia",
      data: "2025-10-12",
      hora: "07:00",
      local: "Parque dos Ipês",
      preco: "R$ 60,00",
      img: "https://images.squarespace-cdn.com/content/v1/5e79e7f3f72f3e6c9393bcc6/1668453933984-7HOIEANKGOY0Q9SFR18V/0H2A5883.jpg?format=2500w",
      desc: "Prova de 5K e 10K com kit do atleta e medalha de participação.",
    },
  ],
  cidades: [
    {
      id: createId(),
      nome: "Dourados",
      uf: "MS",
      desc: "Segunda maior cidade de MS, polo universitário e cultural.",
      pontos: [
        {
          id: createId(),
          nome: "Parque dos Ipês",
          tipo: "Parque",
          horario: "Livre",
          img: "https://images.unsplash.com/photo-1526481280698-8fcc13fdcde7?q=80&w=1200&auto=format&fit=crop",
          desc: "Área verde para caminhada, corrida e lazer ao ar livre.",
        },
        {
          id: createId(),
          nome: "Praça Antônio João",
          tipo: "Praça",
          horario: "24h",
          img: "https://images.unsplash.com/photo-1587308525991-b8dec88ccbe7?q=80&w=1200&auto=format&fit=crop",
          desc: "Cartão-postal no centro, palco de feiras e eventos culturais.",
        },
        {
          id: createId(),
          nome: "Museu Histórico",
          tipo: "Museu",
          horario: "Ter–Dom, 9h–17h",
          img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1200&auto=format&fit=crop",
          desc: "Acervo sobre a história e a formação regional.",
        },
      ],
    },
    {
      id: createId(),
      nome: "Itaporã",
      uf: "MS",
      desc: "Cidade vizinha com tradições culturais marcantes.",
      pontos: [
        {
          id: createId(),
          nome: "Praça Central",
          tipo: "Praça",
          horario: "Livre",
          img: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1200&auto=format&fit=crop",
          desc: "Ponto de encontro com feiras e apresentações locais.",
        },
      ],
    },
  ],
};

function loadFromStorage(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.events && parsed.cidades) {
      return { eventos: parsed.events, cidades: parsed.cidades };
    }
    return null;
  } catch {
    return null;
  }
}

const formatDate = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR", {
    timeZone: "America/Campo_Grande",
  });

export const DouradosPlusPage: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(() => {
    if (typeof window === "undefined") return initialData;
    return loadFromStorage() ?? initialData;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({ events: appState.eventos, cidades: appState.cidades })
    );
  }, [appState]);

  const [activeTab, setActiveTab] = useState<"eventos" | "turismo" | "cidades">(
    "eventos"
  );
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // filtros de eventos
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [dataMin, setDataMin] = useState("");

  // modal de evento
  const [isEventoModalOpen, setIsEventoModalOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);

  const eventosFiltrados = useMemo(() => {
    return appState.eventos
      .slice()
      .sort((a, b) => a.data.localeCompare(b.data))
      .filter((ev) => {
        const okCat = !cat || ev.cat === cat;
        const okData = !dataMin || ev.data >= dataMin;
        const txt = `${ev.titulo} ${ev.local} ${ev.cat}`.toLowerCase();
        const okQ = !search || txt.includes(search.toLowerCase());
        return okCat && okData && okQ;
      });
  }, [appState.eventos, cat, dataMin, search]);

  function handleOpenNovoEvento() {
    setEditingEvento(null);
    setIsEventoModalOpen(true);
  }

  function handleEditEvento(ev: Evento) {
    setEditingEvento(ev);
    setIsEventoModalOpen(true);
  }

  function handleDeleteEvento(id: string) {
    if (!window.confirm("Excluir este evento?")) return;
    setAppState((prev) => ({
      ...prev,
      eventos: prev.eventos.filter((e) => e.id !== id),
    }));
  }

  function handleSalvarEvento(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const titulo = (formData.get("titulo") as string).trim();
    const catValue = (formData.get("cat") as string) || "Show";
    const data = (formData.get("data") as string) || "";
    const hora = (formData.get("hora") as string) || "";
    const preco =
      ((formData.get("preco") as string) || "").trim() || "Gratuito";
    const local = (formData.get("local") as string).trim();
    const img = (formData.get("img") as string).trim();
    const desc = (formData.get("desc") as string).trim();

    if (!titulo || !data || !local) {
      window.alert("Preencha ao menos Título, Data e Local.");
      return;
    }

    const novo: Evento = {
      id: editingEvento?.id ?? createId(),
      titulo,
      cat: catValue,
      data,
      hora,
      preco,
      local,
      img,
      desc,
    };

    setAppState((prev) => {
      const idx = prev.eventos.findIndex((e) => e.id === novo.id);
      if (idx >= 0) {
        const clone = [...prev.eventos];
        clone[idx] = novo;
        return { ...prev, eventos: clone };
      }
      return { ...prev, eventos: [...prev.eventos, novo] };
    });

    setIsEventoModalOpen(false);
    setEditingEvento(null);
  }

  function handleDetalhesEvento(ev: Evento) {
    window.alert(
      `${ev.titulo}
${formatDate(ev.data)} ${ev.hora || ""}
${ev.local}
${ev.preco}

${ev.desc}`
    );
  }

  const cidades = appState.cidades;
  const [cidadeSelecionadaId, setCidadeSelecionadaId] = useState<string | null>(
    () => cidades[0]?.id ?? null
  );
  const [buscaPonto, setBuscaPonto] = useState("");

  const cidadeSelecionada = useMemo(
    () => cidades.find((c) => c.id === cidadeSelecionadaId) ?? cidades[0],
    [cidades, cidadeSelecionadaId]
  );

  const pontosFiltrados = useMemo(() => {
    if (!cidadeSelecionada) return [];
    const q = buscaPonto.toLowerCase();
    return cidadeSelecionada.pontos.filter(
      (p) => !q || `${p.nome} ${p.tipo}`.toLowerCase().includes(q.toLowerCase())
    );
  }, [buscaPonto, cidadeSelecionada]);

  const handleActiveTab = (value: any) => {
    setActiveTab(value)
  }

  const handleSideMenuOpen = () => {
    const atualState = isSideMenuOpen
    setIsSideMenuOpen(!atualState)
  }

  const handleShowFilters = () => {
    setShowFilters((f) => !f)
  }

  // (Nesta versão, o CRUD de cidades/pontos está só exibindo os dados.
  // Se você quiser, no próximo passo migramos também os modais e o CRUD deles.)

  return (
    <div className="min-h-screen text-[#e9f2ff] bg-slate-950">
      {/* Overlay de menu lateral */}
      {isSideMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSideMenuOpen(false)}
        />
      )}

      {/* Side menu */}
      <SideBar open={isSideMenuOpen} handleSideMenuOpen={handleSideMenuOpen} handleActiveTab={handleActiveTab} />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            className="flex flex-col gap-[5px] w-7 h-6 lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={isSideMenuOpen}
            onClick={() => setIsSideMenuOpen((p) => !p)}
          >
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-transform ${
                isSideMenuOpen ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-opacity ${
                isSideMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-transform ${
                isSideMenuOpen ? "-translate-y-[9px] -rotate-45" : ""
              }`}
            />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[conic-gradient(at_50%_50%,#74f1ff,#7cffc1,#a58cff,#74f1ff)] shadow-[0_0_16px_rgba(116,241,255,0.35)]" />
            <span className="font-extrabold tracking-[0.05em] text-lg">
              Dourados<span className="opacity-70">+</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-lg"
              id="btn-toggle-busca"
              onClick={() => setShowFilters((p) => !p)}
              title="Buscar"
            >
              🔍
            </button>
          </div>
        </div>
      </header>

      {/* Filtros topo */}
      {showFilters && (
        <section className="border-b border-white/10 bg-slate-900/80">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
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
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>

                <label className="flex-1 text-sm flex flex-col gap-1">
                  <span>Categoria</span>
                  <select
                    className="w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm outline-none"
                    value={cat}
                    onChange={(e) => setCat(e.target.value)}
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
                    value={dataMin}
                    onChange={(e) => setDataMin(e.target.value)}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold"
                  onClick={() => {
                    setActiveTab("eventos");
                  }}
                >
                  Aplicar filtros
                </button>
                <button
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
                  onClick={() => {
                    setSearch("");
                    setCat("");
                    setDataMin("");
                  }}
                >
                  Limpar
                </button>
                <button
                  className="rounded-xl border border-[#a58cff]/50 bg-gradient-to-r from-[#74f1ff]/30 to-[#a58cff]/30 px-4 py-2 text-sm font-semibold"
                  onClick={handleOpenNovoEvento}
                >
                  + Novo evento
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 pb-16 pt-8">
        {/* Hero */}
        <section className="flex flex-col items-center justify-center text-center mb-8">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 relative overflow-hidden">
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
              <strong>cidades da região</strong>. Visual inovador, rápido e
              acessível — agora em React + Tailwind.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === "eventos"
                ? "border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/20 to-[#a58cff]/20"
                : "border-white/10 bg-white/5"
            }`}
            onClick={() => setActiveTab("eventos")}
          >
            Eventos
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === "turismo"
                ? "border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/20 to-[#a58cff]/20"
                : "border-white/10 bg-white/5"
            }`}
            onClick={() => setActiveTab("turismo")}
          >
            Turismo
          </button>
          <button
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeTab === "cidades"
                ? "border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/20 to-[#a58cff]/20"
                : "border-white/10 bg-white/5"
            }`}
            onClick={() => setActiveTab("cidades")}
          >
            Cidades
          </button>
        </div>

        {/* Painéis */}
        {activeTab === "eventos" && (
          <section aria-label="Lista de eventos">
            {eventosFiltrados.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#9fb0c8]">
                Nenhum evento encontrado. Tente ajustar os filtros.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {eventosFiltrados.map((ev) => (
                  <article
                    key={ev.id}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex flex-col"
                  >
                    <img
                      src={ev.img || ""}
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
                          {ev.cat}
                        </span>
                        <span className="text-[#9fb0c8]">
                          {formatDate(ev.data)} • {ev.hora || ""}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold">{ev.titulo}</h3>
                      <p className="text-xs text-[#9fb0c8]">
                        {ev.local} • {ev.preco}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <button
                          className="rounded-xl border border-white/10 bg-white/10 px-3 py-1"
                          onClick={() => handleDetalhesEvento(ev)}
                        >
                          Detalhes
                        </button>
                        <button
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-1"
                          onClick={() => handleEditEvento(ev)}
                        >
                          Editar
                        </button>
                        <button
                          className="rounded-xl border border-red-500/50 bg-red-500/10 px-3 py-1"
                          onClick={() => handleDeleteEvento(ev.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {activeTab === "turismo" && (
          <section
            aria-label="Pontos turísticos"
            className="mt-4 grid gap-4 lg:grid-cols-3"
          >
            {/* esquerda: filtros + lista */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch">
                  <label className="flex-1 text-sm flex flex-col gap-1">
                    <span>Cidade</span>
                    <select
                      className="w-full rounded-xl border border-white/20 bg-slate-800 px-3 py-2 text-sm outline-none"
                      value={cidadeSelecionada?.id ?? ""}
                      onChange={(e) => setCidadeSelecionadaId(e.target.value)}
                    >
                      {cidades.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome} - {c.uf}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex-1 text-sm flex flex-col gap-1">
                    <span>Buscar ponto</span>
                    <input
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm outline-none"
                      placeholder="Ex.: Parque, Museu…"
                      value={buscaPonto}
                      onChange={(e) => setBuscaPonto(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              {/* lista de pontos */}
              <div className="grid gap-4 md:grid-cols-2">
                {pontosFiltrados.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-[#9fb0c8] md:col-span-2">
                    Nenhum ponto encontrado para esta cidade.
                  </div>
                ) : (
                  pontosFiltrados.map((p) => (
                    <article
                      key={p.id}
                      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 flex flex-col"
                    >
                      <img
                        src={p.img || ""}
                        alt="Imagem do ponto turístico"
                        className="h-40 w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "https://picsum.photos/800/450?blur=2";
                        }}
                      />
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 font-semibold">
                            {p.tipo || "Ponto"}
                          </span>
                          {cidadeSelecionada && (
                            <span className="text-[#9fb0c8]">
                              {cidadeSelecionada.nome}/{cidadeSelecionada.uf}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-extrabold">{p.nome}</h3>
                        <p className="text-xs text-[#9fb0c8]">
                          Horário: {p.horario || "—"}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* direita: sobre/dica */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-base font-extrabold mb-1">Sobre</h3>
                <p className="text-xs text-[#9fb0c8]">
                  Cadastre e gerencie pontos turísticos de Dourados e adicione
                  cidades da região para ampliar o guia.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h3 className="text-base font-extrabold mb-1">Dica rápida</h3>
                <p className="text-xs text-[#9fb0c8]">
                  Em uma próxima evolução, você pode adicionar edição e exclusão
                  de pontos diretamente nos cartões, usando o mesmo padrão de
                  modais dos eventos.
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "cidades" && (
          <section aria-label="Cidades da região" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cidades.map((c) => (
                <article
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 font-semibold">
                      {c.uf}
                    </span>
                    <span className="text-[#9fb0c8]">
                      {c.pontos.length} ponto(s)
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold">{c.nome}</h3>
                  <p className="text-xs text-[#9fb0c8]">{c.desc || ""}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#9fb0c8]">
        Dourados+ • Projeto Inovador • Turma 2024.45.253 • Senac-MS.
      </footer>

      {/* Modal de Evento */}
      {isEventoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-900 p-4 md:p-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <strong className="text-sm md:text-base">
                {editingEvento ? "Editar evento" : "Novo evento"}
              </strong>
              <button
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs"
                onClick={() => {
                  setIsEventoModalOpen(false);
                  setEditingEvento(null);
                }}
              >
                Fechar
              </button>
            </div>

            <form
              className="flex flex-col gap-4 text-sm"
              onSubmit={handleSalvarEvento}
            >
              <div className="flex flex-col md:flex-row gap-3">
                <label className="flex-1 flex flex-col gap-1">
                  <span>Título</span>
                  <input
                    name="titulo"
                    defaultValue={editingEvento?.titulo ?? ""}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                  />
                </label>
                <label className="flex-1 flex flex-col gap-1">
                  <span>Categoria</span>
                  <select
                    name="cat"
                    defaultValue={editingEvento?.cat ?? "Show"}
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
                    defaultValue={editingEvento?.data ?? ""}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                  />
                </label>
                <label className="flex-1 flex flex-col gap-1">
                  <span>Hora</span>
                  <input
                    type="time"
                    name="hora"
                    defaultValue={editingEvento?.hora ?? ""}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                  />
                </label>
                <label className="flex-1 flex flex-col gap-1">
                  <span>Preço</span>
                  <input
                    name="preco"
                    placeholder="Ex.: Gratuito ou R$ 30,00"
                    defaultValue={editingEvento?.preco ?? ""}
                    className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span>Local</span>
                <input
                  name="local"
                  placeholder="Endereço / bairro"
                  defaultValue={editingEvento?.local ?? ""}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Imagem (URL)</span>
                <input
                  name="img"
                  placeholder="Cole o link da imagem"
                  defaultValue={editingEvento?.img ?? ""}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span>Descrição</span>
                <textarea
                  name="desc"
                  rows={4}
                  placeholder="Detalhes do evento…"
                  defaultValue={editingEvento?.desc ?? ""}
                  className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none resize-none"
                />
              </label>

              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="rounded-xl border border-[#a58cff]/60 bg-gradient-to-r from-[#74f1ff]/30 to-[#a58cff]/30 px-4 py-2 text-xs font-semibold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
