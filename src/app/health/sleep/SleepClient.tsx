"use client";

import { useState } from "react";
import { Card, CardHead, AreaChart } from "@/components/ui";
import { addSleep as addSleepAction } from "@/lib/actions";

const inp: React.CSSProperties = {
  padding: "8px 12px",
  background: "var(--paper-card)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
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
const fmt = (n: number) => String(n).replace(".", ",");

export default function SleepClient({
  avg7,
  today,
  history,
  chartData,
}: {
  avg7: number;
  today: { hours: number; from_time: string | null; to_time: string | null } | null;
  history: { date: string; hours: number }[];
  chartData: { l: string; v: number }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [fromTime, setFromTime] = useState("22:00");
  const [toTime, setToTime] = useState("06:00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSleepAction(fromTime, toTime);
    setShowForm(false);
  };

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <div className="row center" style={{ gap: 14, marginBottom: 18 }}>
          <span
            className="num"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52, color: "var(--ink)", lineHeight: 1 }}
          >
            {fmt(avg7)}
          </span>
          <div className="col" style={{ gap: 2 }}>
            <span className="t-small" style={{ color: "var(--ink-soft)", fontWeight: 500 }}>ч в среднем</span>
            <span className="t-small" style={{ color: "var(--ink-mute)" }}>цель 8 ч · 7 дней</span>
          </div>
        </div>
        <AreaChart data={chartData} goal={8} height={160} />
      </Card>

      <Card delay={80}>
        <CardHead label="сегодня" />
        {today ? (
          <div className="row" style={{ gap: 32, flexWrap: "wrap" }}>
            {today.from_time && (
              <div className="col" style={{ gap: 4 }}>
                <span className="t-label" style={{ color: "var(--ink-mute)" }}>лёг</span>
                <span className="num t-body" style={{ fontWeight: 600 }}>{today.from_time}</span>
              </div>
            )}
            {today.to_time && (
              <div className="col" style={{ gap: 4 }}>
                <span className="t-label" style={{ color: "var(--ink-mute)" }}>встал</span>
                <span className="num t-body" style={{ fontWeight: 600 }}>{today.to_time}</span>
              </div>
            )}
            <div className="col" style={{ gap: 4 }}>
              <span className="t-label" style={{ color: "var(--ink-mute)" }}>часов</span>
              <span className="num t-body" style={{ fontWeight: 600 }}>{fmt(today.hours)}</span>
            </div>
          </div>
        ) : (
          <p className="t-small" style={{ color: "var(--ink-mute)" }}>Данных за сегодня нет.</p>
        )}
      </Card>

      <Card delay={120}>
        <CardHead
          label="история"
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
            <div className="row" style={{ gap: 12 }}>
              <div className="col" style={{ flex: 1, gap: 4 }}>
                <label className="t-label" style={{ color: "var(--ink-mute)" }}>Лёг</label>
                <input type="time" style={inp} value={fromTime} onChange={(e) => setFromTime(e.target.value)} required />
              </div>
              <div className="col" style={{ flex: 1, gap: 4 }}>
                <label className="t-label" style={{ color: "var(--ink-mute)" }}>Встал</label>
                <input type="time" style={inp} value={toTime} onChange={(e) => setToTime(e.target.value)} required />
              </div>
            </div>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <button type="submit" style={btnPrimary}>Сохранить</button>
              <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        )}
        <div className="col">
          {history.length === 0 && (
            <p className="t-small" style={{ color: "var(--ink-mute)" }}>Записей нет.</p>
          )}
          {history.map((s, i) => (
            <div
              key={i}
              className="row between center"
              style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
            >
              <span className="t-body">{s.date}</span>
              <span
                className="num t-body"
                style={{
                  fontWeight: 600,
                  color: s.hours >= 8 ? "var(--accent)" : "var(--ink)",
                }}
              >
                {fmt(s.hours)} ч
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
