"use client";

import { useState } from "react";
import { Card, CardHead, Metric } from "@/components/ui";
import { Icon } from "@/components/icons";
import { addDiaryEntry as addDiaryEntryAction } from "@/lib/actions";

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

type Entry = { date: string; weekday: string; preview: string; mood: number; hasVoice: boolean; hasPhoto: boolean };

export default function DiaryClient({
  entries,
  summary,
}: {
  entries: Entry[];
  summary: { count: number; avgMood: string; voice: number; photo: number };
}) {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState(7);

  const filtered = search.trim()
    ? entries.filter((e) => e.preview.toLowerCase().includes(search.toLowerCase()))
    : entries;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await addDiaryEntryAction(content.trim(), mood);
    setShowForm(false);
    setContent(""); setMood(7);
  };

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <div className="row between" style={{ gap: 16, flexWrap: "wrap" }}>
          <Metric value={`${summary.count}`} label="записей" />
          <Metric value={summary.avgMood} label="настроение" />
          <Metric value={`${summary.voice}`} label="голосовых" />
          <Metric value={`${summary.photo}`} label="с фото" />
        </div>
      </Card>

      {showForm && (
        <Card delay={0}>
          <CardHead label="новая запись" />
          <form onSubmit={handleSubmit} className="col" style={{ gap: 12 }}>
            <textarea
              style={{ ...inp, resize: "vertical", minHeight: 120 }}
              placeholder="Что происходит сегодня?.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              autoFocus
            />
            <div className="col" style={{ gap: 6 }}>
              <div className="row between center">
                <label className="t-label" style={{ color: "var(--ink-mute)" }}>Настроение</label>
                <span className="num t-body" style={{ fontWeight: 700, fontSize: 22, color: "var(--accent)" }}>
                  {mood}
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }}
              />
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="submit" style={btnPrimary}>Сохранить</button>
              <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </Card>
      )}

      <Card delay={60}>
        <div className="row" style={{ gap: 10, alignItems: "center" }}>
          <div style={{ display: "grid", placeItems: "center", color: "var(--ink-mute)", flexShrink: 0 }}>
            <Icon name="book" size={16} stroke={1.6} />
          </div>
          <input
            style={{ ...inp, flex: 1, background: "transparent", border: "none", padding: "0" }}
            placeholder="Поиск по записям…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {!showForm && (
            <button className="link-action" style={{ flexShrink: 0 }} onClick={() => setShowForm(true)}>
              + запись
            </button>
          )}
        </div>
      </Card>

      {filtered.length === 0 && (
        <Card delay={80}>
          <p className="t-small" style={{ color: "var(--ink-mute)" }}>
            {search ? "Ничего не найдено." : "Записей пока нет."}
          </p>
        </Card>
      )}

      {filtered.map((e, i) => (
        <Card key={i} delay={80 + i * 20}>
          <div className="row between" style={{ alignItems: "baseline", marginBottom: 10, gap: 12 }}>
            <p className="t-d2" style={{ textTransform: "capitalize" }}>{e.date} · {e.weekday}</p>
            <div className="row center" style={{ gap: 10, color: "var(--ink-mute)" }}>
              {e.hasVoice && <Icon name="pen" size={14} stroke={1.6} />}
              {e.hasPhoto && <Icon name="calendar" size={14} stroke={1.6} />}
              <span className="t-micro">настроение {e.mood}/10</span>
            </div>
          </div>
          <p className="t-body" style={{ color: "var(--ink-soft)", lineHeight: 1.65 }}>{e.preview}</p>
        </Card>
      ))}
    </div>
  );
}
