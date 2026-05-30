"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHead, Checkbox, Bars, Badge } from "@/components/ui";
import { toggleNamaz as toggleNamazAction } from "@/lib/actions";

type Prayer = { key: string; name: string; done: boolean };

export default function NamazClient({
  todayPrayers,
  monthStats,
  streak,
  last14,
  barsData,
}: {
  todayPrayers: Prayer[];
  monthStats: { done: number; total: number; pct: number };
  streak: number;
  last14: { date: string; weekday: string; done: number }[];
  barsData: { l: string; v: number; accent?: boolean }[];
}) {
  const [prayers, setPrayers] = useState(todayPrayers);
  const [, startTransition] = useTransition();
  useEffect(() => setPrayers(todayPrayers), [todayPrayers]);

  const doneCount = prayers.filter((p) => p.done).length;

  const toggle = (key: string) => {
    const next = !prayers.find((p) => p.key === key)?.done;
    setPrayers((ps) => ps.map((x) => (x.key === key ? { ...x, done: next } : x)));
    startTransition(() => { toggleNamazAction(key, next); });
  };

  return (
    <div className="col" style={{ gap: 18 }}>
      <Card delay={40}>
        <CardHead label="сегодня" />
        <div className="col">
          {prayers.map((p, i) => (
            <div key={p.key}>
              {i > 0 && <hr className="hr" />}
              <div className="task-row" data-done={p.done}>
                <Checkbox checked={p.done} onChange={() => toggle(p.key)} />
                <span className="task-text t-body" style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="t-small" style={{ color: "var(--ink-mute)", marginTop: 12 }}>
          {doneCount} из 5 намазов сегодня
        </p>
      </Card>

      <div className="grid2">
        <Card delay={80}>
          <CardHead label="этот месяц" />
          <div className="col" style={{ gap: 8 }}>
            <span
              className="num"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, color: "var(--ink)" }}
            >
              {monthStats.pct}%
            </span>
            <span className="t-small" style={{ color: "var(--ink-mute)" }}>
              {monthStats.done} из {monthStats.total} намазов
            </span>
          </div>
        </Card>

        <Card delay={100}>
          <CardHead label="серия" />
          <div className="col" style={{ gap: 8 }}>
            <span
              className="num"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 36, color: "var(--ink)" }}
            >
              {streak}
            </span>
            <span className="t-small" style={{ color: "var(--ink-mute)" }}>
              {streak === 1 ? "день подряд 5/5" : streak >= 2 && streak <= 4 ? "дня подряд 5/5" : "дней подряд 5/5"}
            </span>
          </div>
        </Card>
      </div>

      {barsData.length > 0 && (
        <Card delay={120}>
          <CardHead label="за 30 дней" />
          <Bars data={barsData} height={130} goal={5} />
        </Card>
      )}

      {last14.length > 0 && (
        <Card delay={160}>
          <CardHead label="последние 14 дней" />
          <div className="col">
            {last14.map((d, i) => (
              <div
                key={i}
                className="row between center"
                style={{ padding: "10px 0", borderTop: i ? "1px solid var(--line)" : "none" }}
              >
                <div className="col" style={{ gap: 2 }}>
                  <span className="t-body">{d.date}</span>
                  <span className="t-small" style={{ color: "var(--ink-mute)", textTransform: "capitalize" }}>{d.weekday}</span>
                </div>
                <Badge variant={d.done === 5 ? "success" : d.done >= 3 ? "accent" : "neutral"}>
                  {d.done}/5
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
