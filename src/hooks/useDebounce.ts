import { useEffect, useRef, useState } from "react";

/**
 * Debounce a value; useful for auto-save on field blur/change.
 */
export function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setDebounced(value), delayMs);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [value, delayMs]);

  return debounced;
}
