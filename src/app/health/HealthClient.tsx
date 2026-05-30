"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { PageTitle, Card, CardHead, AreaChart, Bars } from "@/components/ui";
import { Icon } from "@/components/icons";

type Props = {
  sleepHistory: { date: string; hours: number }[];
  weightHistory: { date: string; kg: number }[];
  caloriesHistory: { date: string; kcal: number }[];
  namazWeek: { date: string; done: number }[];
  trainingHistory: { type: string; intensity: string; date: string; duration: number }[];
};

type MetricKey = "sleep" | "weight" | "calories";

export default function HealthClient(props: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const m = sp.get("m");
  const metric: MetricKey = m === "weight" || m === "calories" ? m : "sleep";

  const setMetric = (next: MetricKey) => {
    if (next === metric) return;
    const params = new URLSearchParams(sp.toString());
    if (next === "sleep") params.delete("m");
    else params.set("m", next);
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const cfgs: Record<MetricKey, { label: string; data: { l: string; v: number }[]; unit: string; goal?: number; fmt: (v: number) => string }> = {
    sleep: { label: "Сон", data: props.sleepHistory.map((d) => ({ l: d.date, v: d.hours })), unit: "ч", goal: 8, fmt: (v) => v.toFixed(1) },
    weight: { label: "Вес", data: props.weightHistory.map((d) => ({ l: d.date, v: d.kg })), unit: "кг", fmt: (v) => v.toFixed(1) },
    calories: { label: "Калории", data: props.caloriesHistory.map((d) => ({ l: d.date, v: d.kcal })), unit: "ккал", fmt: (v) => `${Math.round(v)}` },
  };

  const cfg = cfgs[metric];
  const vals = cfg.data.map((d) => d.v);
  const has = vals.length > 0;
  const latest = has ? vals[vals.length - 1] : 0;
  const avg = has ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const namazBars = props.namazWeek.map((n) => ({ l: n.date, v: n.done, accent: n.done >= 5 }));

  return (
    <>
      <PageTitle title="Здоровье" />

      <div className="col" style={{ gap: 18 }}>
        <Card delay={40}>
          <div className="row between center" style={{ marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
            <div className="seg">
              {(Object.keys(cfgs) as MetricKey[]).map((k) => (
                <button key={k} data-on={k === metric ? "true" : "false"} onClick={() => setMetric(k)}>{cfgs[k].label}</button>
              ))}
            </div>
            <div className="row center" style={{ gap: 14 }}>
              <div className="col">
                <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 26, color: "var(--ink)" }}>
                  {has ? cfg.fmt(latest) : "—"}<span style={{ fontSize: 13, color: "var(--ink-mute)", fontWeight: 500, marginLeft: 4 }}>{cfg.unit}</span>
                </span>
                <span className="t-micro" style={{ color: "var(--ink-mute)" }}>последнее</span>
              </div>
              <div className="col">
                <span className="num t-small" style={{ color: "var(--ink-soft)", fontWeight: 600 }}>{has ? cfg.fmt(avg) : "—"} {cfg.unit}</span>
                <span className="t-micro" style={{ color: "var(--ink-mute)" }}>в среднем</span>
              </div>
            </div>
          </div>
          <AreaChart data={cfg.data} height={170} goal={cfg.goal} />
        </Card>

        <div className="grid2">
          <Card delay={80}>
            <CardHead label="намаз за неделю" />
            <Bars data={namazBars} height={120} goal={5} />
          </Card>

          <Card id="training" delay={120}>
            <CardHead label="тренировки" />
            <div className="col">
              {props.trainingHistory.length === 0 && <p className="t-small" style={{ color: "var(--ink-mute)" }}>Записей нет.</p>}
              {props.trainingHistory.map((t, i) => (
                <div key={i} className="row center" style={{ gap: 12, padding: "11px 0", borderTop: i ? "1px solid var(--line)" : "none" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--paper-sunk)", display: "grid", placeItems: "center", color: "var(--ink-soft)", flexShrink: 0 }}>
                    <Icon name="dumbbell" size={17} stroke={1.6} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="t-small" style={{ fontWeight: 600, textTransform: "capitalize" }}>{t.type}</p>
                    <p className="t-micro" style={{ color: "var(--ink-soft)", marginTop: 2 }}>{t.intensity} · {t.date}</p>
                  </div>
                  <span className="num t-small" style={{ color: "var(--ink-mute)" }}>{t.duration}м</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
