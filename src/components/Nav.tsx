"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { Icon } from "@/components/icons";
import { useTheme } from "./ThemeProvider";

type NavItem = { id: string; icon: string; label: string; href: string };

const NAV_GROUPS: NavItem[][] = [
  [
    { id: "today",   icon: "home",     label: "Сегодня",     href: "/" },
    { id: "diary",   icon: "book",     label: "Дневник",     href: "/diary" },
  ],
  [
    { id: "sleep",    icon: "moon",     label: "Сон",         href: "/health/sleep" },
    { id: "weight",   icon: "scale",    label: "Вес",         href: "/health/weight" },
    { id: "food",     icon: "utensils", label: "Питание",     href: "/health/food" },
    { id: "namaz",    icon: "prayer",   label: "Намаз",       href: "/health/namaz" },
    { id: "training", icon: "dumbbell", label: "Тренировки",  href: "/health/training" },
  ],
  [
    { id: "goals",     icon: "target",  label: "Цели",      href: "/goals" },
    { id: "deadlines", icon: "bell",    label: "Дедлайны",  href: "/deadlines" },
    { id: "anxiety",   icon: "wind",    label: "Тревоги",   href: "/anxiety" },
    { id: "chat",      icon: "message", label: "Чат",       href: "/chat" },
  ],
];

const SETTINGS: NavItem = { id: "settings", icon: "settings", label: "Настройки", href: "/settings" };

function getActiveId(pathname: string): string {
  if (pathname === "/") return "today";
  if (pathname === "/diary") return "diary";
  if (pathname === "/health/sleep" || pathname === "/health") return "sleep";
  if (pathname === "/health/weight") return "weight";
  if (pathname === "/health/food") return "food";
  if (pathname === "/health/namaz") return "namaz";
  if (pathname === "/health/training") return "training";
  if (pathname === "/goals" || pathname === "/projects") return "goals";
  if (pathname === "/deadlines") return "deadlines";
  if (pathname === "/anxiety") return "anxiety";
  if (pathname === "/chat") return "chat";
  if (pathname === "/settings") return "settings";
  return "";
}

function RailButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  return (
    <button
      className="rail-item"
      data-on={active ? "true" : "false"}
      onClick={onClick}
      aria-label={item.label} title={item.label}
    >
      <Icon name={item.icon} size={21} stroke={1.6} />
      <span className="rail-tip">{item.label}</span>
    </button>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const [show, setShow] = useState(false);
  useEffect(() => setShow(true), []);
  return (
    <button className="rail-item" onClick={toggle} aria-label="Сменить тему" title="Сменить тему">
      <span style={{ display: "inline-grid", placeItems: "center", width: 21, height: 21 }} suppressHydrationWarning>
        {show ? (theme === "dark" ? <Sun size={21} strokeWidth={1.6} /> : <Moon size={21} strokeWidth={1.6} />) : null}
      </span>
      <span className="rail-tip">Тема</span>
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const active = getActiveId(pathname);

  return (
    <aside className="sidebar">
      <div className="sidebar-mark">L</div>
      <div className="sidebar-scroll">
        {NAV_GROUPS.map((group, gi) => (
          <div className="sidebar-group" key={gi}>
            {group.map((item) => (
              <RailButton key={item.id} item={item} active={active === item.id} onClick={() => router.push(item.href)} />
            ))}
          </div>
        ))}
      </div>
      <RailButton item={SETTINGS} active={active === "settings"} onClick={() => router.push(SETTINGS.href)} />
      <ThemeToggle />
    </aside>
  );
}

const TABS: NavItem[] = [
  { id: "today",    icon: "home",     label: "Сегодня",  href: "/" },
  { id: "diary",    icon: "book",     label: "Дневник",  href: "/diary" },
  { id: "sleep",    icon: "moon",     label: "Здоровье", href: "/health/sleep" },
  { id: "goals",    icon: "target",   label: "Цели",     href: "/goals" },
  { id: "settings", icon: "settings", label: "Ещё",      href: "/settings" },
];

export function TabBarMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const active = getActiveId(pathname);
  return (
    <nav className="tabbar-mobile">
      {TABS.map((t) => {
        const on =
          active === t.id ||
          (t.id === "sleep" && ["sleep", "weight", "food", "namaz", "training"].includes(active)) ||
          (t.id === "goals" && ["goals", "deadlines"].includes(active)) ||
          (t.id === "settings" && ["settings", "anxiety", "chat"].includes(active));
        return (
          <button
            key={t.id}
            className="tab-item"
            data-on={on ? "true" : "false"}
            onClick={() => router.push(t.href)}
            aria-label={t.label}
          >
            <Icon name={t.icon} size={20} stroke={1.6} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
