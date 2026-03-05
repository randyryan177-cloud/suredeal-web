"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any value.
 * @param value - The value to be debounced (string, number, etc.)
 * @param delay - Delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay expires
    // This is what prevents the API from being hammered on every keystroke
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}