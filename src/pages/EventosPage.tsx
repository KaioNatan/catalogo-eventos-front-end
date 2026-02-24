import { useState } from "react";
import Header from "../features/eventos/componentes/Header";
import { Card } from "../shared/ui";

const EventosPage = () => {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  const handleSideMenuOpen = () => {
    setIsSideMenuOpen((prev) => !prev);
  };

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

      <Header
        open={isSideMenuOpen}
        handleSideMenuOpen={handleSideMenuOpen}
      />
      <main
        id="conteudo-principal"
        className="max-w-5xl mx-auto px-4 pb-16 pt-8"
      >
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-4">Eventos em Dourados</h1>
          <p className="mb-4">
            Esta seção apresenta uma lista de eventos culturais, festivais, exposições e atividades recreativas que acontecem na cidade de Dourados. Explore as opções disponíveis e aproveite tudo o que a cidade tem a oferecer!
          </p>
          <p>
            Fique atento às datas e locais dos eventos, e não perca a oportunidade de vivenciar a rica cultura local de Dourados.
          </p>
        </Card>
        
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#9fb0c8]">
        Dourados+ • Projeto Inovador • Turma 2024.45.253 • Senac-MS.
      </footer>
    </div>
  );
};

export default EventosPage;
