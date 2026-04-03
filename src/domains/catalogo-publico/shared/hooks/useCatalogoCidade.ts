import type { ICity } from "@/entities/city/city.types";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";
import { useSearchParams } from "react-router-dom";
import { toApiError } from "@/services/api/apiError";
import { loadPublishedCitiesCatalog } from "@/services/public-api/publicCities.api";

const DEFAULT_SLUG_FALLBACK = "dourados";

interface IUseCatalogoCidadeResult {
  cidadeSlug: string;
  cidadeNome: string;
  cidades: ICity[];
  isLoadingCidades: boolean;
  errorCidades: string | null;
  /** Catálogo pode buscar dados somente após cidades publicadas estarem disponíveis. */
  isCitiesReady: boolean;
  handleCidadeChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  setCidadeSlug: (slug: string) => void;
}

function pickDefaultSlug(cities: ICity[]): string {
  if (cities.length === 0) {
    return DEFAULT_SLUG_FALLBACK;
  }
  const preferred: ICity | undefined = cities.find(
    (cidade: ICity) => cidade.slug === DEFAULT_SLUG_FALLBACK,
  );
  return preferred?.slug ?? cities[0]!.slug;
}

export function useCatalogoCidade(): IUseCatalogoCidadeResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cidades, setCidades] = useState<ICity[]>([]);
  const [isLoadingCidades, setIsLoadingCidades] = useState<boolean>(true);
  const [errorCidades, setErrorCidades] = useState<string | null>(null);

  useEffect(() => {
    let isActive: boolean = true;

    async function loadCities(): Promise<void> {
      try {
        setIsLoadingCidades(true);
        setErrorCidades(null);
        const response: ICity[] = await loadPublishedCitiesCatalog();
        if (!isActive) {
          return;
        }
        setCidades(response);
      } catch (caught) {
        if (!isActive) {
          return;
        }
        setErrorCidades(toApiError(caught).message);
        setCidades([]);
      } finally {
        if (isActive) {
          setIsLoadingCidades(false);
        }
      }
    }

    void loadCities();

    return () => {
      isActive = false;
    };
  }, []);

  const defaultSlug: string = useMemo(
    () => pickDefaultSlug(cidades),
    [cidades],
  );

  const cidadeSlug: string = useMemo(() => {
    const slugFromUrl: string | null = searchParams.get("cidade");

    if (!slugFromUrl) {
      return defaultSlug;
    }

    const isValid: boolean = cidades.some(
      (cidade: ICity) => cidade.slug === slugFromUrl,
    );

    return isValid ? slugFromUrl : defaultSlug;
  }, [searchParams, cidades, defaultSlug]);

  const cidadeNome: string = useMemo(() => {
    const cidade: ICity | undefined = cidades.find(
      (item: ICity) => item.slug === cidadeSlug,
    );
    return cidade?.name ?? "";
  }, [cidades, cidadeSlug]);

  const setCidadeSlug = useCallback(
    (slug: string): void => {
      const isValid: boolean = cidades.some(
        (cidade: ICity) => cidade.slug === slug,
      );
      const nextSlug: string = isValid ? slug : defaultSlug;
      const nextParams: URLSearchParams = new URLSearchParams(searchParams);
      nextParams.set("cidade", nextSlug);
      setSearchParams(nextParams, { replace: true });
    },
    [cidades, defaultSlug, searchParams, setSearchParams],
  );

  const handleCidadeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      setCidadeSlug(event.target.value);
    },
    [setCidadeSlug],
  );

  const isCitiesReady: boolean =
    !isLoadingCidades && errorCidades === null && cidades.length > 0;

  return {
    cidadeSlug,
    cidadeNome,
    cidades,
    isLoadingCidades,
    errorCidades,
    isCitiesReady,
    handleCidadeChange,
    setCidadeSlug,
  };
}
