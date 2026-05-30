"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });

export function useTheme() { return useContext(ThemeCtx); }

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  // На клиенте после mount читаем сохранённую тему из localStorage.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("life-theme");
      if (saved === "dark" || saved === "light") setTheme(saved);
    } catch {}
  }, []);

  // При смене темы — обновляем атрибут <html> и сохраняем.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("life-theme", theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}
