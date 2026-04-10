import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ClassValue } from "clsx";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

const AVATAR_COLOR_SETS = [
  "bg-violet-500 text-white",
  "bg-sky-400 text-white",
  "bg-emerald-400 text-white",
  "bg-amber-500 text-white",
  "bg-rose-400 text-white",
  "bg-teal-400 text-white",
  "bg-orange-400 text-white",
];

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function hashNameToColor(name: string): string {
  const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLOR_SETS[hash % AVATAR_COLOR_SETS.length];
}

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
