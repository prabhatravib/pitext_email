import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

// Replacement for nuqs useQueryState that works with React Router
export function useQueryState(key: string) {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(key);

  const setValue = useCallback((newValue: string | null) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (newValue === null) {
      newSearchParams.delete(key);
    } else {
      newSearchParams.set(key, newValue);
    }
    setSearchParams(newSearchParams);
  }, [key, searchParams, setSearchParams]);

  return [value, setValue] as const;
}

// Replacement for nuqs parseAsBoolean with withDefault support
export function parseAsBoolean(value: string | null): boolean {
  return value === 'true';
}

// Enhanced parseAsBoolean with withDefault support
export function parseAsBooleanWithDefault(defaultValue: boolean) {
  return (value: string | null) => {
    if (value === null) return defaultValue;
    return value === 'true';
  };
}

// Replacement for nuqs parseAsString
export function parseAsString(value: string | null): string | null {
  return value;
}

// Enhanced parseAsString with withDefault support
export function parseAsStringWithDefault(defaultValue: string) {
  return (value: string | null) => {
    return value ?? defaultValue;
  };
} 