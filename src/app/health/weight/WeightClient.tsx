"use client";

import { useState } from "react";
import { Card, CardHead, AreaChart } from "@/components/ui";
import { Icon } from "@/components/icons";
import { addWeight as addWeightAction } from "@/lib/actions";

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
const fmt = (n: number) => n.toFixed(1).replace(".", ",");

export default function WeightClient({
  latest,
  trend,
  goal,
  history,
  chartData,
}: {
  latest: number | null;
  trend: "up" | "down" | "flat";
  goal: { target: number; current: number; unit: string } | null;
  history: { date: string; kg: number }[];
  chartData: { l: string; v: number }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [kg, setKg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(kg.replace(",", "."));
    if (isNaN(val)) return;
    await addWeightAction(val);
    setShowForm(false);
    setKg("");
  };

  const trendIcon = trend === "up" ? "arrowUp" : trend === "down" ? "arrowDown" : null;
  const goalPct = goal && goal.target ? Math.min(Math.round((goal.current / goal.target) * 100), 100) : null;

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <div className="row center" style={{ gap: 14, marginBottom: 18 }}>
          <span
            className="num"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 52, color: "var(--ink)", lineHeight: 1 }}
          >
            {latest != null ? fmt(latest) : "—"}
          </span>
          <div className="col" style={{ gap: 4 }}>
            <div className="row center" style={{ gap: 6 }}>
              <span className="t-small" style={{ color: "var(--ink-soft)", fontWeight: 500 }}>кг</span>
              {trendIcon && (
                <Icon
                  name={trendIcon}
                  size={16}
                  stroke={2}
                  style={{ color: trend === "up" ? "var(--danger, #e74)" : "var(--accent)" }}
                />
              )}
            </div>
            {goal && (
              <span className="t-small" style={{ color: "var(--ink-mute)" }}>
                цель {goal.target} {goal.unit}
              </span>
            )}
          </div>
        </div>
        {goal && goalPct !== null && (
          <div style={{ marginBottom: 16 }}>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="t-small" style={{ color: "var(--ink-mute)" }}>прогресс к цели</span>
              <span className="t-small" style={{ fontWeight: 600 }}>{goalPct}%</span>
            </div>
            <div style={{ height: 6, background: "var(--paper-sunk)", borderRadius: 4, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${goalPct}%`,
                  background: "var(--accent)",
                  borderRadius: 4,
                  transition: "width 0.8s var(--ease)",
                }}
              />
            </div>
          </div>
        )}
        <AreaChart data={chartData} height={160} />
      </Card>

      <Card delay={80}>
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
            <div className="col" style={{ gap: 4 }}>
              <label className="t-label" style={{ color: "var(--ink-mute)" }}>Вес (кг)</label>
              <input
                type="number"
                step="0.1"
                style={inp}
                placeholder="70.5"
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                required
              />
            </div>
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <button type="submit" style={btnPrimary}>Сохранить</button>
              <button type="button" className="link-action" onClick={() => { setShowForm(false); setKg(""); }}>
                Отмена
              </button>
            </div>
          </form>
        )}
        <div className="col">
          {history.length === 0 && (
            <p className="t-small" style={{ color: "var(--ink-mute)" }}>Записей нет.</p>
          )}
          {history.map((w, i) => (
            <div
              key={i}
              className="row between center"
              style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
            >
              <span className="t-body">{w.date}</span>
              <span className="num t-body" style={{ fontWeight: 600 }}>{fmt(w.kg)} кг</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
