import type { ICity } from "@/entities/city/city.types";
import type { IInstitutionalContent } from "@/entities/institutional/institutional.types";
import type { ISocialLink } from "@/entities/social-link/socialLink.types";
import type { IEvent } from "@/entities/event/event.types";
import type { ITouristPoint } from "@/entities/tourist-point/touristPoint.types";
import type {
  IHomeBanner,
  IHomeHighlight,
} from "@/entities/home-content/homeContent.types";

let institutionalContentMock: IInstitutionalContent = {
  id: 1,

  aboutTitle: "Sobre o Celeiro do MS",
  aboutText:
    "O Celeiro do MS é uma iniciativa voltada à valorização do território, da cultura, do turismo e das experiências regionais.",

  whoWeAreTitle: "Quem somos",
  whoWeAreText:
    "Somos uma vitrine digital do território, conectando pessoas, cidades e oportunidades por meio de uma experiência pública simples e acessível.",

  purposeTitle: "Propósito",
  purposeText:
    "Promover visibilidade regional e fortalecer a identidade local por meio da divulgação de eventos, atrativos e conteúdos institucionais.",

  mission:
    "Divulgar eventos, atrativos turísticos e experiências regionais, fortalecendo a economia local e ampliando o acesso à informação.",

  vision:
    "Ser a principal referência digital de turismo e agenda cultural da região do Celeiro do MS.",

  values: ["Excelência", "Sustentabilidade", "Regionalismo"],

  updatedAt: new Date().toISOString(),
};

/** Quando `false`, o admin trata como «ainda não cadastrado» (lista vazia). */
let institutionalRecordPresent = true;

export function isInstitutionalRecordPresent(): boolean {
  return institutionalRecordPresent;
}

export function setInstitutionalRecordPresent(present: boolean): void {
  institutionalRecordPresent = present;
}

let socialLinksMock: ISocialLink[] = [
  {
    id: 1,
    platform: "instagram",
    label: "Instagram",
    url: "https://instagram.com",
    active: true,
    order: 1,
  },
  {
    id: 2,
    platform: "facebook",
    label: "Facebook",
    url: "https://facebook.com",
    active: true,
    order: 2,
  },
  {
    id: 3,
    platform: "youtube",
    label: "YouTube",
    url: "https://youtube.com",
    active: true,
    order: 3,
  },
];

const cityTimestamps = (): Pick<ICity, "createdAt" | "updatedAt"> => ({
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

let citiesMock: ICity[] = [
  {
    id: 1,
    name: "Dourados",
    slug: "dourados",
    state: "MS",
    summary:
      "Centro regional com forte vida cultural, eventos e experiências de turismo.",
    description:
      "Dourados integra o território do Celeiro do MS e concentra atividades culturais, comerciais e turísticas relevantes para a região.",
    imageUrl: "/images/cidades/dourados.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 2,
    name: "Itaporã",
    slug: "itapora",
    state: "MS",
    summary: "Cidade conectada à identidade regional do Celeiro do MS.",
    description:
      "Itaporã compõe a área de atuação do Celeiro do MS e pode destacar cultura local, agenda e atrativos próprios.",
    imageUrl: "/images/cidades/itapora.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 3,
    name: "Caarapó",
    slug: "caarapo",
    state: "MS",
    summary:
      "Município com relevância regional e potencial de valorização cultural e turística.",
    description:
      "Caarapó faz parte do território do Celeiro do MS e pode ser apresentado no portal com conteúdos institucionais, agenda e atrativos.",
    imageUrl: "/images/cidades/caarapo.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 4,
    name: "Fátima do Sul",
    slug: "fatima-do-sul",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Fátima do Sul integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/fatima-do-sul.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 5,
    name: "Jateí",
    slug: "jatei",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Jateí integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/jatei.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 6,
    name: "Deodápolis",
    slug: "deodapolis",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Deodápolis integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/deodapolis.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 7,
    name: "Douradina",
    slug: "douradina",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Douradina integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/douradina.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 8,
    name: "Vicentina",
    slug: "vicentina",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Vicentina integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/vicentina.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 9,
    name: "Juti",
    slug: "juti",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description: "Juti integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/juti.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 10,
    name: "Glória de Dourados",
    slug: "gloria-de-dourados",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Glória de Dourados integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/gloria-de-dourados.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 11,
    name: "Maracaju",
    slug: "maracaju",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Maracaju integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/maracaju.jpg",
    published: true,
    ...cityTimestamps(),
  },
  {
    id: 12,
    name: "Rio Brilhante",
    slug: "rio-brilhante",
    state: "MS",
    summary: "Município do território do Celeiro do MS.",
    description:
      "Rio Brilhante integra a rede de cidades atendidas pelo Celeiro do MS.",
    imageUrl: "/images/cidades/rio-brilhante.jpg",
    published: true,
    ...cityTimestamps(),
  },
];

let eventsMock: IEvent[] = [
  {
    id: 1,
    cityId: 1,
    citySlug: "dourados",
    name: "Festival Gastronômico de Dourados",
    description:
      "Sabores regionais, música e experiências culturais para valorizar o território.",
    category: "gastronomia",
    startDate: "2026-03-20",
    endDate: "2026-03-22",
    formattedDate: "20 a 22 de março de 2026",
    location: "Parque dos Ipês",
    imageUrl: "/images/highlights/festival-gastronomico.jpg",
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    cityId: 2,
    citySlug: "itapora",
    name: "Feira Cultural de Itaporã",
    description: "Evento cultural com artesanato, música e gastronomia local.",
    category: "feira",
    startDate: "2026-04-10",
    endDate: "2026-04-10",
    formattedDate: "10 de abril de 2026",
    location: "Praça Central",
    imageUrl: "/images/highlights/feira-cultural-itapora.jpg",
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let touristPointsMock: ITouristPoint[] = [
  {
    id: 1,
    cityId: 1,
    citySlug: "dourados",
    name: "Parque Antenor Martins",
    description:
      "Área verde com lago, pista de caminhada e espaço de lazer para moradores e visitantes.",
    category: "parque",
    address: "Rua Antônio Emílio de Figueiredo",
    openingHours: "08:00",
    imageUrl: "/images/highlights/parque-antenor-martins.jpg",
    featured: true,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    cityId: 2,
    citySlug: "itapora",
    name: "Praça Central de Itaporã",
    description:
      "Espaço urbano de convivência com potencial para eventos e circulação local.",
    category: "praça",
    address: "Centro de Itaporã",
    openingHours: "09:00",
    imageUrl: "/images/highlights/praca-central-itapora.jpg",
    featured: false,
    published: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let homeBannersMock: IHomeBanner[] = [
  {
    id: 1,
    title: "Descubra o Celeiro do MS",
    subtitle: "Cultura, turismo e experiências regionais em destaque.",
    imageUrl: "/images/banners/banner-home-1.jpg",
    ctaLabel: "Explorar eventos",
    ctaUrl: "/eventos",
    active: true,
    order: 1,
  },
];

let homeHighlightsMock: IHomeHighlight[] = [
  {
    id: 1,
    type: "event",
    referenceId: "event-1",
    title: "Festival Gastronômico de Dourados",
    description: "Sabores regionais, música e experiências culturais.",
    cityName: "Dourados",
    imageUrl: "/images/highlights/festival-gastronomico.jpg",
    ctaUrl: "/eventos/event-1",
    active: true,
    order: 1,
  },
  {
    id: 2,
    type: "tourist-point",
    referenceId: "tourist-point-1",
    title: "Parque Antenor Martins",
    description: "Natureza, lazer e convivência em Dourados.",
    cityName: "Dourados",
    imageUrl: "/images/highlights/parque-antenor-martins.jpg",
    ctaUrl: "/pontos-turisticos/tourist-point-1",
    active: true,
    order: 2,
  },
];

export async function adminMockDelay(delayMs: number = 300): Promise<void> {
  await new Promise<void>((resolve: () => void) => {
    window.setTimeout(resolve, delayMs);
  });
}

export function getInstitutionalContentMock(): IInstitutionalContent {
  return institutionalContentMock;
}

export function setInstitutionalContentMock(
  nextValue: IInstitutionalContent,
): void {
  institutionalContentMock = nextValue;
}

export function getSocialLinksMock(): ISocialLink[] {
  return [...socialLinksMock].sort((left, right) => left.order - right.order);
}

export function setSocialLinksMock(nextValue: ISocialLink[]): void {
  socialLinksMock = [...nextValue];
}

export function getCitiesMock(): ICity[] {
  return [...citiesMock].sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR"),
  );
}

export function setCitiesMock(nextValue: ICity[]): void {
  citiesMock = [...nextValue];
}

export function getEventsMock(): IEvent[] {
  return [...eventsMock].sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR"),
  );
}

export function setEventsMock(nextValue: IEvent[]): void {
  eventsMock = [...nextValue];
}

export function getTouristPointsMock(): ITouristPoint[] {
  return [...touristPointsMock].sort((left, right) =>
    left.name.localeCompare(right.name, "pt-BR"),
  );
}

export function setTouristPointsMock(nextValue: ITouristPoint[]): void {
  touristPointsMock = [...nextValue];
}

export function getHomeBannersMock(): IHomeBanner[] {
  return [...homeBannersMock].sort((left, right) => left.order - right.order);
}

export function setHomeBannersMock(nextValue: IHomeBanner[]): void {
  homeBannersMock = [...nextValue];
}

export function getHomeHighlightsMock(): IHomeHighlight[] {
  return [...homeHighlightsMock].sort(
    (left, right) => left.order - right.order,
  );
}

export function setHomeHighlightsMock(nextValue: IHomeHighlight[]): void {
  homeHighlightsMock = [...nextValue];
}
