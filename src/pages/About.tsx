import { useState } from "react";
import Header from "../features/eventos/componentes/Header";
import { Card } from "../shared/ui";

const AboutPage = () => {
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
          <h1 className="text-3xl font-bold mb-4">Sobre o Dourados+</h1>
          <p className="mb-4">
            O Dourados+ é um projeto inovador desenvolvido por alunos do Senac-MS, com o objetivo de criar um catálogo digital de eventos, pontos turísticos e informações sobre as cidades da região de Dourados. Este projeto visa promover a cultura local, incentivar o turismo e facilitar o acesso às informações para moradores e visitantes.
          </p>
          <p className="mb-4">
            A plataforma oferece uma interface amigável e intuitiva, permitindo que os usuários explorem uma variedade de eventos culturais, festivais, exposições e atividades recreativas. Além disso, o Dourados+ destaca os pontos turísticos mais importantes da região, proporcionando uma experiência enriquecedora para aqueles que desejam conhecer melhor a cidade.
          </p>
          <p>
            O Dourados+ é mais do que um simples catálogo; é uma ferramenta de conexão entre a comunidade local e os visitantes, promovendo o desenvolvimento cultural e econômico da região. Através deste projeto, esperamos contribuir para o fortalecimento da identidade local e para o crescimento do turismo em Dourados.
          </p>
        </Card>
        
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-[#9fb0c8]">
        Dourados+ • Projeto Inovador • Turma 2024.45.253 • Senac-MS.
      </footer>
    </div>
  );
};

export default AboutPage;
