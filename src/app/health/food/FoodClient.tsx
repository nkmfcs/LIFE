"use client";

import { useState } from "react";
import { Card, CardHead, Bars } from "@/components/ui";
import { Icon } from "@/components/icons";
import { addFood as addFoodAction } from "@/lib/actions";

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

export default function FoodClient({
  todayCalories,
  todayGoal,
  todayFoods,
  calByDay,
  topItems,
}: {
  todayCalories: number;
  todayGoal: number;
  todayFoods: { time: string; item: string; calories: number; composition: string | null }[];
  calByDay: { l: string; v: number }[];
  topItems: { item: string; count: number }[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [item, setItem] = useState("");
  const [calories, setCalories] = useState("");
  const [composition, setComposition] = useState("");
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  });

  const pct = Math.min(Math.round((todayCalories / todayGoal) * 100), 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cal = parseInt(calories);
    if (!item.trim() || isNaN(cal)) return;
    await addFoodAction(item.trim(), cal, time, composition.trim() || undefined);
    setShowForm(false);
    setItem(""); setCalories(""); setComposition("");
  };

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <CardHead label="сегодня" />
        <div className="row center" style={{ gap: 14, marginBottom: 16 }}>
          <span
            className="num"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 48, color: "var(--ink)", lineHeight: 1 }}
          >
            {todayCalories}
          </span>
          <div className="col" style={{ gap: 2 }}>
            <span className="t-small" style={{ color: "var(--ink-soft)", fontWeight: 500 }}>ккал</span>
            <span className="t-small" style={{ color: "var(--ink-mute)" }}>цель {todayGoal}</span>
          </div>
        </div>
        <div style={{ height: 8, background: "var(--paper-sunk)", borderRadius: 5, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: pct >= 100 ? "var(--danger, #e74)" : "var(--accent)",
              borderRadius: 5,
              transition: "width 0.8s var(--ease)",
            }}
          />
        </div>
        <span className="t-small" style={{ color: "var(--ink-mute)", marginTop: 6 }}>{pct}% от нормы</span>
      </Card>

      {calByDay.length > 0 && (
        <Card delay={80}>
          <CardHead label="калории по дням" />
          <Bars data={calByDay} height={130} goal={todayGoal} />
        </Card>
      )}

      <Card delay={120}>
        <CardHead
          label="приёмы пищи"
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
            <input
              style={inp}
              placeholder="Блюдо"
              value={item}
              onChange={(e) => setItem(e.target.value)}
              required
              autoFocus
            />
            <div className="row" style={{ gap: 8 }}>
              <input
                type="number"
                style={{ ...inp, flex: 1 }}
                placeholder="Калории"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
              <input
                type="time"
                style={{ ...inp, flex: 1 }}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <textarea
              style={{ ...inp, resize: "vertical", minHeight: 56 }}
              placeholder="Состав: куриная грудка, рис, помидор..."
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
            />
            <div className="row" style={{ gap: 8, marginTop: 4 }}>
              <button type="submit" style={btnPrimary}>Добавить</button>
              <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        )}
        {todayFoods.length === 0 && !showForm && (
          <p className="t-small" style={{ color: "var(--ink-mute)" }}>Приёмов пищи сегодня нет.</p>
        )}
        {todayFoods.map((f, i) => (
          <div
            key={i}
            className="row center"
            style={{ gap: 12, padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
          >
            <div
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: "var(--paper-sunk)", display: "grid",
                placeItems: "center", color: "var(--ink-soft)", flexShrink: 0,
              }}
            >
              <Icon name="utensils" size={15} stroke={1.6} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="t-small" style={{ fontWeight: 600 }}>{f.item}</p>
              {f.composition && (
                <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 2 }}>{f.composition}</p>
              )}
              {f.time && !f.composition && (
                <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 2 }}>{f.time}</p>
              )}
              {f.time && f.composition && (
                <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 1 }}>{f.time}</p>
              )}
            </div>
            <span className="num t-small" style={{ color: "var(--ink-mute)" }}>{f.calories} ккал</span>
          </div>
        ))}
      </Card>

      {topItems.length > 0 && (
        <Card delay={160}>
          <CardHead label="топ блюд за 30 дней" />
          <div className="col">
            {topItems.map((t, i) => (
              <div
                key={i}
                className="row between center"
                style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
              >
                <span className="t-body">{t.item}</span>
                <span className="t-small" style={{ color: "var(--ink-mute)" }}>{t.count}×</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
