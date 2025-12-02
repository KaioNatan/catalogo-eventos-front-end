export interface SideBarProps {
    open: boolean;
    handleSideMenuOpen: () => void
    handleActiveTab: (value:"eventos" | "turismo" | "cidades") => void
}

export default function SideBar({ open, handleSideMenuOpen, handleActiveTab }: SideBarProps) {

    return (
        <nav
            className={`fixed top-0 left-0 z-50 h-full w-72 bg-[#232f3e] text-white transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"
                }`}
            aria-label="Menu lateral de navegação"
        >
            <button
                className="absolute top-3 right-4 text-2xl"
                onClick={() => handleSideMenuOpen()}
                aria-label="Fechar menu"
            >
                &times;
            </button>

            <div className="pt-20">
                <a
                    href="#"
                    className="block px-6 py-3 border-b border-white/10 hover:bg-[#37475a]"
                    onClick={(e) => {
                        e.preventDefault();
                        handleActiveTab("eventos");
                        handleSideMenuOpen();
                    }}
                >
                    Início / Eventos
                </a>
                <a
                    href="#"
                    className="block px-6 py-3 border-b border-white/10 hover:bg-[#37475a]"
                    onClick={(e) => {
                        e.preventDefault();
                        handleActiveTab("eventos");
                        handleSideMenuOpen();
                    }}
                >
                    Eventos e Categorias
                </a>
                <a
                    href="#"
                    className="block px-6 py-3 border-b border-white/10 hover:bg-[#37475a]"
                    onClick={(e) => {
                        e.preventDefault();
                        handleActiveTab("turismo");
                        handleSideMenuOpen();
                    }}
                >
                    Turismo
                </a>
                <a
                    href="#"
                    className="block px-6 py-3 border-b border-white/10 hover:bg-[#37475a]"
                    onClick={(e) => {
                        e.preventDefault();
                        handleActiveTab("cidades");
                        handleSideMenuOpen();
                    }}
                >
                    Cidades da região
                </a>
            </div>
        </nav>
    )
}