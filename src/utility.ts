import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function checkIsDarkMode(): boolean {
  const prefersDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  return prefersDarkQuery.matches;
}
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
