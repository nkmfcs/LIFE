"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Прокручивает к элементу с id, указанному в #hash, после монтирования.
// Работает корректно с Next App Router (где hash-навигация сама не скроллит).
export function HashScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const t = setTimeout(() => {
      const el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
