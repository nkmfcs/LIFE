"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";

export function TopBar({ userName }: { userName: string }) {
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
  }, []);
  const initial = userName.charAt(0).toUpperCase() || "A";
  return (
    <div className="topbar">
      <span className="t-small" style={{ color: "var(--ink-mute)", textTransform: "lowercase", minHeight: "1.3em" }} suppressHydrationWarning>{date}</span>
      <div className="row center" style={{ gap: 2 }}>
        <button className="iconbtn" aria-label="Уведомления"><Icon name="bell" size={20} stroke={1.6} /></button>
        <button className="iconbtn" aria-label="Добавить"><Icon name="plus" size={21} stroke={1.8} /></button>
        <div className="topbar-avatar" title={userName}>{initial}</div>
      </div>
    </div>
  );
}
