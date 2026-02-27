import { clsx, type ClassValue } from "clsx";

// Utility for merging Tailwind classes conditionally
// Usage: cn("base-class", condition && "conditional-class", "always-applied")
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
