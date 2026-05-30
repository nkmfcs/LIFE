"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Добавляет класс is-ready после монтирования (и заново при смене маршрута),
// чтобы карточки .rise плавно появлялись.
export function ReadyGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = setTimeout(() => setReady(true), 40);
    return () => clearTimeout(t);
  }, [pathname]);
  return <div className={ready ? "is-ready" : ""}>{children}</div>;
}
