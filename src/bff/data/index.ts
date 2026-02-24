import type { AppState } from "../../context/appDataContext";
const createId = () => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID() as string;
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};
export default {
    eventos: [
        { 
            id: createId(), 
            titulo: "Festival Gastronômico do Centro", 
            cat: "Gastronomia", 
            data: "2025-09-20", 
            hora: "18:00", 
            local: "Rua Ponciano, Centro", 
            preco: "Gratuito", 
            img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1200&auto=format&fit=crop", 
            desc: "Barracas, food trucks e música ao vivo com artistas locais." 
        },
        { 
            id: createId(), 
            titulo: "Corrida Parque dos Ipês 10K", 
            cat: "Esporte", 
            data: "2025-10-12", 
            hora: "07:00", 
            local: "Parque dos Ipês", 
            preco: "R$ 60,00", 
            img: "https://images.unsplash.com/photo-1520975682031-a6d9a185c8ec?q=80&w=1200&auto=format&fit=crop", 
            desc: "Prova de 5K e 10K com kit do atleta e medalha de participação." 
        },
        { 
            id: createId(), 
            titulo: "Mostra de Teatro Estudantil", 
            cat: "Teatro", 
            data: "2025-08-28", 
            hora: "19:30", 
            local: "Teatro Municipal", 
            preco: "R$ 20,00", 
            img: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=1200&auto=format&fit=crop", 
            desc: "Apresentações de grupos escolares da cidade e região." 
        },
        { 
            id: createId(), 
            titulo: "Feira de Artes e Artesanato", 
            cat: "Feira", 
            data: "2025-09-05", 
            hora: "09:00", 
            local: "Praça Antônio João", 
            preco: "Gratuito", 
            img: "https://images.unsplash.com/photo-1521334726092-b509a19597f2?q=80&w=1200&auto=format&fit=crop", 
            desc: "Exposição e venda de artes locais, oficinas e apresentações culturais." 
        },
        { 
            id: createId(), 
            titulo: "Show no Parque – Banda Local", 
            cat: "Show", 
            data: "2025-09-07", 
            hora: "17:00", 
            local: "Parque Alvorada", 
            preco: "R$ 30,00", 
            img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop", 
            desc: "Clássicos do rock nacional ao pôr do sol." 
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
                    desc: "Área verde para caminhada, corrida e lazer ao ar livre." 
                },
                { 
                    id: createId(), 
                    nome: "Praça Antônio João", 
                    tipo: "Praça", 
                    horario: "24h", 
                    img: "https://images.unsplash.com/photo-1587308525991-b8dec88ccbe7?q=80&w=1200&auto=format&fit=crop", 
                    desc: "Cartão-postal no centro, palco de feiras e eventos culturais." },
                { 
                    id: createId(), 
                    nome: "Museu Histórico", 
                    tipo: "Museu", 
                    horario: "Ter–Dom, 9h–17h", 
                    img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=1200&auto=format&fit=crop", 
                    desc: "Acervo sobre a história e a formação regional." },
            ]
        },
        {
            id: createId(), nome: "Itaporã", uf: "MS", desc: "Cidade vizinha com tradições culturais marcantes.", pontos: [
                { id: createId(), nome: "Praça Central", tipo: "Praça", horario: "Livre", img: "https://images.unsplash.com/photo-1471623432079-b009d30b6729?q=80&w=1200&auto=format&fit=crop", desc: "Ponto de encontro com feiras e apresentações locais." },
            ]
        }
    ]
} as AppState;