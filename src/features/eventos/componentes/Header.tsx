export interface HeaderProps {
    open: boolean;
    handleSideMenuOpen: () => void;
    handleShowFilters: () => void;
}

export default function Header({ handleShowFilters, handleSideMenuOpen, open }: HeaderProps) {

    return (
        <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            className="flex flex-col gap-[5px] w-7 h-6 lg:hidden"
            aria-label="Abrir menu"
            aria-expanded={open}
            onClick={() => handleSideMenuOpen()}
          >
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-transform ${
                open ? "translate-y-[9px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`h-[3px] rounded bg-[#e9f2ff] transition-transform ${
                open ? "-translate-y-[9px] -rotate-45" : ""
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
              onClick={() => handleShowFilters()}
              title="Buscar"
            >
              🔍
            </button>
          </div>
        </div>
      </header>
    )
}