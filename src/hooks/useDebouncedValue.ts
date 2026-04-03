import { useEffect, useState } from "react";

/**
 * Valor atualizado após `delayMs` sem mudanças (útil para buscas com debounce).
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => {
      window.clearTimeout(id);
    };
  }, [value, delayMs]);

  return debounced;
}
