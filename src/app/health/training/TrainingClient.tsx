"use client";

import { useState } from "react";
import { Card, CardHead, ProgressRing } from "@/components/ui";
import { Icon } from "@/components/icons";
import { addTraining as addTrainingAction } from "@/lib/actions";

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

const TYPES = ["силовая", "кардио", "йога", "другое"];
const INTENSITIES = ["низкая", "средняя", "высокая"];

export default function TrainingClient({
  all,
  thisWeekCount,
  weekGoal,
}: {
  all: { type: string; duration: number; intensity: string; date: string; notes: string | null }[];
  thisWeekCount: number;
  weekGoal: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState("силовая");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("средняя");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseInt(duration);
    if (isNaN(d) || d <= 0) return;
    await addTrainingAction(type, d, intensity, notes.trim() || undefined);
    setShowForm(false);
    setDuration(""); setNotes("");
  };

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <CardHead label="эта неделя" />
        <div className="row center" style={{ gap: 24 }}>
          <ProgressRing
            value={weekGoal ? thisWeekCount / weekGoal : 0}
            size={96}
            stroke={8}
            label={`${thisWeekCount}`}
            sublabel={`из ${weekGoal}`}
            delay={60}
          />
          <div className="col" style={{ gap: 6 }}>
            <span className="t-body" style={{ fontWeight: 600 }}>
              {thisWeekCount === 0
                ? "Тренировок пока нет"
                : thisWeekCount < weekGoal
                  ? `Ещё ${weekGoal - thisWeekCount} до цели`
                  : "Цель недели достигнута!"}
            </span>
            <span className="t-small" style={{ color: "var(--ink-mute)" }}>
              цель: {weekGoal} тренировки в неделю
            </span>
          </div>
        </div>
      </Card>

      <Card delay={80}>
        <CardHead
          label="все тренировки"
          right={
            <button className="link-action" onClick={() => setShowForm((v) => !v)}>
              + добавить
            </button>
          }
        />
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="col"
            style={{ gap: 8, marginBottom: 16, padding: 12, background: "var(--paper-sunk)", borderRadius: 10 }}
          >
            <div className="row" style={{ gap: 8 }}>
              <select
                style={{ ...inp, flex: 1 }}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select
                style={{ ...inp, flex: 1 }}
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
              >
                {INTENSITIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <input
              type="number"
              style={inp}
              placeholder="Длительность (мин)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
            <textarea
              style={{ ...inp, resize: "vertical", minHeight: 60 }}
              placeholder="Заметки (необязательно)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <button type="submit" style={btnPrimary}>Добавить</button>
              <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        )}
        {all.length === 0 && !showForm && (
          <p className="t-small" style={{ color: "var(--ink-mute)" }}>Записей нет.</p>
        )}
        {all.map((t, i) => (
          <div
            key={i}
            className="row center"
            style={{ gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--paper-sunk)",
                display: "grid",
                placeItems: "center",
                color: "var(--ink-soft)",
                flexShrink: 0,
              }}
            >
              <Icon name="dumbbell" size={17} stroke={1.6} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="t-small" style={{ fontWeight: 600, textTransform: "capitalize" }}>{t.type}</p>
              <p className="t-micro" style={{ color: "var(--ink-soft)", marginTop: 2 }}>
                {t.intensity} · {t.date}
                {t.notes ? ` · ${t.notes}` : ""}
              </p>
            </div>
            <span className="num t-small" style={{ color: "var(--ink-mute)" }}>{t.duration} мин</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
