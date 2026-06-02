"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";

const SECTIONS = [
  { label: "Сон",         icon: "moon",     href: "/health/sleep",     desc: "История и статистика сна" },
  { label: "Вес",         icon: "scale",    href: "/health/weight",    desc: "Динамика веса и цель" },
  { label: "Питание",     icon: "utensils", href: "/health/food",      desc: "Калории и состав блюд" },
  { label: "Намаз",       icon: "prayer",   href: "/health/namaz",     desc: "Трекер молитв" },
  { label: "Тренировки",  icon: "dumbbell", href: "/health/training",  desc: "План и история тренировок" },
  { label: "Дедлайны",    icon: "bell",     href: "/deadlines",        desc: "Дела с датой" },
  { label: "Тревоги",     icon: "wind",     href: "/anxiety",          desc: "Записи и паттерны" },
  { label: "Чат с Claude",icon: "message",  href: "/chat",             desc: "AI по твоим данным" },
  { label: "Настройки",   icon: "settings", href: "/settings",         desc: "Профиль и параметры" },
];

export default function MorePage() {
  const router = useRouter();
  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: "24px 0 16px" }}>
        <h1 className="t-d1">Разделы</h1>
      </div>
      <div className="col" style={{ gap: 0 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.href}
            onClick={() => router.push(s.href)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 0",
              background: "none",
              border: "none",
              borderBottom: "1px solid var(--line)",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "var(--paper-sunk)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-soft)",
                flexShrink: 0,
              }}
            >
              <Icon name={s.icon} size={20} stroke={1.6} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="t-small" style={{ fontWeight: 600, color: "var(--ink)" }}>{s.label}</p>
              <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 2 }}>{s.desc}</p>
            </div>
            <Icon name="chevron" size={18} stroke={1.6} style={{ color: "var(--ink-mute)" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
