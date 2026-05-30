"use client";

import { useState } from "react";
import { PageTitle, Card, CardHead, Badge } from "@/components/ui";
import { addAnxiety as addAnxietyAction } from "@/lib/actions";

const inp: React.CSSProperties = {
  padding: "8px 12px",
  background: "var(--paper-card)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const btnPrimary: React.CSSProperties = {
  padding: "8px 16px",
  background: "var(--accent)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

type Entry = { id: number; date: string; level: number; thought: string; trigger: string | null };

function levelVariant(l: number): "danger" | "accent" | "neutral" {
  return l >= 8 ? "danger" : l >= 5 ? "accent" : "neutral";
}

export default function AnxietyClient({
  entries,
  patterns,
}: {
  entries: Entry[];
  patterns: { topTrigger: string | null; avgLevel: string } | null;
}) {
  const [showForm, setShowForm] = useState(false);
  const [level, setLevel] = useState(5);
  const [thought, setThought] = useState("");
  const [trigger, setTrigger] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thought.trim()) return;
    await addAnxietyAction(level, thought.trim(), trigger.trim() || undefined);
    setShowForm(false);
    setLevel(5); setThought(""); setTrigger("");
  };

  return (
    <>
      <PageTitle title="Тревоги" />
      <div className="col" style={{ gap: 18 }}>
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            style={{
              ...btnPrimary,
              width: "100%",
              padding: "16px",
              fontSize: 15,
              borderRadius: 12,
              background: "var(--paper-card)",
              color: "var(--ink)",
              border: "1px solid var(--line)",
            }}
          >
            + записать тревогу
          </button>
        ) : (
          <Card delay={0}>
            <CardHead label="новая запись" />
            <form onSubmit={handleSubmit} className="col" style={{ gap: 12 }}>
              <div className="col" style={{ gap: 6 }}>
                <div className="row between center">
                  <label className="t-label" style={{ color: "var(--ink-mute)" }}>Уровень тревоги</label>
                  <span
                    className="num t-body"
                    style={{ fontWeight: 700, fontSize: 22, color: "var(--accent)" }}
                  >
                    {level}
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--accent)" }}
                />
                <div className="row between">
                  <span className="t-small" style={{ color: "var(--ink-mute)" }}>1 — спокойно</span>
                  <span className="t-small" style={{ color: "var(--ink-mute)" }}>10 — паника</span>
                </div>
              </div>
              <textarea
                style={{ ...inp, resize: "vertical", minHeight: 80 }}
                placeholder="Что беспокоит?"
                value={thought}
                onChange={(e) => setThought(e.target.value)}
                required
                autoFocus
              />
              <input
                style={inp}
                placeholder="Триггер (необязательно)"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
              />
              <div className="row" style={{ gap: 8 }}>
                <button type="submit" style={btnPrimary}>Записать</button>
                <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
              </div>
            </form>
          </Card>
        )}

        {patterns && (
          <Card delay={60}>
            <CardHead label="паттерны" />
            <div className="row" style={{ gap: 24, flexWrap: "wrap" }}>
              <div className="col" style={{ gap: 4 }}>
                <span className="t-label" style={{ color: "var(--ink-mute)" }}>средний уровень</span>
                <span className="num t-body" style={{ fontWeight: 700, fontSize: 24 }}>{patterns.avgLevel}</span>
              </div>
              {patterns.topTrigger && (
                <div className="col" style={{ gap: 4 }}>
                  <span className="t-label" style={{ color: "var(--ink-mute)" }}>частый триггер</span>
                  <span className="t-body" style={{ fontWeight: 600 }}>{patterns.topTrigger}</span>
                </div>
              )}
            </div>
          </Card>
        )}

        {entries.length > 0 && (
          <Card delay={80}>
            <CardHead label="записи" />
            <div className="col">
              {entries.map((e, i) => (
                <div
                  key={e.id}
                  className="col"
                  style={{ gap: 6, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
                >
                  <div className="row center" style={{ gap: 10 }}>
                    <span className="t-small" style={{ color: "var(--ink-mute)" }}>{e.date}</span>
                    <Badge variant={levelVariant(e.level)}>{e.level}/10</Badge>
                    {e.trigger && (
                      <span className="t-small" style={{ color: "var(--ink-mute)" }}>{e.trigger}</span>
                    )}
                  </div>
                  <p className="t-body" style={{ color: "var(--ink-soft)", lineHeight: 1.5 }}>
                    {e.thought.length > 120 ? e.thought.slice(0, 120) + "…" : e.thought}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
