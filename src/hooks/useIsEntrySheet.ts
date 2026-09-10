"use client";

import { usePathname } from "next/navigation";

export function useIsEntrySheet(): boolean {
  const pathname = usePathname();
  return /\/entry\/[^/]+\/(sheet-|review)/.test(pathname);
}
