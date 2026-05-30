"use client";

import { PageTitle, Card, CardHead } from "@/components/ui";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsClient({
  name,
  telegramId,
}: {
  name: string;
  telegramId: string;
}) {
  const { theme, toggle } = useTheme();

  return (
    <>
      <PageTitle title="Настройки" />
      <div className="col" style={{ gap: 18 }}>
        <Card delay={40}>
          <CardHead label="профиль" />
          <div className="col" style={{ gap: 10 }}>
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Имя</span>
              <span className="t-body" style={{ fontWeight: 600 }}>{name}</span>
            </div>
            <hr className="hr" />
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Часовой пояс</span>
              <span className="t-body" style={{ fontWeight: 600 }}>UTC+5 (Узбекистан)</span>
            </div>
          </div>
        </Card>

        <Card delay={80}>
          <CardHead label="цели по умолчанию" />
          <div className="col" style={{ gap: 10 }}>
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Норма сна</span>
              <span className="t-body" style={{ fontWeight: 600 }}>8 ч</span>
            </div>
            <hr className="hr" />
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Тренировок в неделю</span>
              <span className="t-body" style={{ fontWeight: 600 }}>3</span>
            </div>
            <hr className="hr" />
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Калорий в день</span>
              <span className="t-body" style={{ fontWeight: 600 }}>2000 ккал</span>
            </div>
          </div>
        </Card>

        <Card delay={120}>
          <CardHead label="телеграм-бот" />
          <div className="col" style={{ gap: 10 }}>
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Telegram ID</span>
              <span className="num t-body" style={{ fontWeight: 600 }}>{telegramId}</span>
            </div>
            <hr className="hr" />
            <div className="row between center">
              <span className="t-body" style={{ color: "var(--ink-soft)" }}>Статус</span>
              <span className="t-small" style={{ color: "var(--accent)", fontWeight: 600 }}>● подключён</span>
            </div>
          </div>
        </Card>

        <Card delay={160}>
          <CardHead label="тема" />
          <div className="row" style={{ gap: 10 }}>
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { if (theme !== t) toggle(); }}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1.5px solid",
                  borderColor: theme === t ? "var(--accent)" : "var(--line)",
                  background: theme === t ? "var(--accent)" : "transparent",
                  color: theme === t ? "var(--paper)" : "var(--ink-soft)",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t === "light" ? "Светлая" : "Тёмная"}
              </button>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
