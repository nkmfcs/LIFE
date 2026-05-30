"use client";

import { useEffect, useState, useTransition } from "react";
import { Hero, Card, CardHead, Checkbox, Badge, ProgressRing, AreaChart } from "@/components/ui";
import { Icon } from "@/components/icons";
import {
  toggleNamaz as toggleNamazAction,
  toggleDeadline as toggleDeadlineAction,
  togglePlanItem as togglePlanItemAction,
  toggleTask as toggleTaskAction,
  addDeadline as addDeadlineAction,
} from "@/lib/actions";

type State = { sleep: number; namazDone: number; namazTotal: number; calories: number; energy: number };
type Prayer = { key: string; name: string; done: boolean };
type Deadline = { id: number; title: string; due: string; daysLeft: number; project: string; done: boolean };
type WeekPt = { l: string; v: number };
type Move = { minutes: number; goal: number; value: number };
type Feed = { t: string; icon: string; text: string; meta: string | null };
type PlanItem = { id: number; time: string; title: string; category: string; duration: number | null; done: boolean };
type Task = { id: number; title: string; project: string; urgent: boolean; done: boolean };

const catIcon: Record<string, string> = {
  morning: "sunrise",
  work: "code",
  sport: "dumbbell",
  food: "utensils",
  namaz: "prayer",
  sleep: "moon",
  evening: "moon",
};

const fmt = (n: number) => String(n).replace(".", ",");

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  background: "var(--paper-card)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 14,
  color: "var(--ink)",
  outline: "none",
  boxSizing: "border-box",
};

export default function TodayClient(props: {
  userName: string;
  state: State; namazPrayers: Prayer[]; deadlines: Deadline[];
  sleepWeek: WeekPt[]; move: Move; feed: Feed[];
  plan: PlanItem[]; tasks: Task[];
}) {
  const { userName, state, sleepWeek, move, feed } = props;
  const [prayers, setPrayers] = useState(props.namazPrayers);
  const [deadlines, setDeadlines] = useState(props.deadlines);
  const [planItems, setPlanItems] = useState(props.plan);
  const [taskItems, setTaskItems] = useState(props.tasks);
  const [showAddDl, setShowAddDl] = useState(false);
  const [dlTitle, setDlTitle] = useState("");
  const [dlDate, setDlDate] = useState("");
  const [dlProject, setDlProject] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => setPrayers(props.namazPrayers), [props.namazPrayers]);
  useEffect(() => setDeadlines(props.deadlines), [props.deadlines]);
  useEffect(() => setPlanItems(props.plan), [props.plan]);
  useEffect(() => setTaskItems(props.tasks), [props.tasks]);

  const doneCount = prayers.filter((p) => p.done).length;

  const togglePrayer = (key: string) => {
    const next = !prayers.find((p) => p.key === key)?.done;
    setPrayers((ps) => ps.map((x) => (x.key === key ? { ...x, done: next } : x)));
    startTransition(() => { toggleNamazAction(key, next); });
  };
  const toggleDl = (id: number) => {
    const next = !deadlines.find((d) => d.id === id)?.done;
    setDeadlines((ds) => ds.map((x) => (x.id === id ? { ...x, done: next } : x)));
    startTransition(() => { toggleDeadlineAction(id, next); });
  };
  const togglePlan = (id: number) => {
    const next = !planItems.find((p) => p.id === id)?.done;
    setPlanItems((ps) => ps.map((x) => (x.id === id ? { ...x, done: next } : x)));
    startTransition(() => { togglePlanItemAction(id, next); });
  };
  const toggleTask = (id: number) => {
    const next = !taskItems.find((t) => t.id === id)?.done;
    setTaskItems((ts) => ts.map((x) => (x.id === id ? { ...x, done: next } : x)));
    startTransition(() => { toggleTaskAction(id, next); });
  };
  const handleAddDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = dlTitle.trim();
    const date = dlDate;
    if (!title || !date) return;
    await addDeadlineAction(title, date, dlProject.trim() || undefined);
    setShowAddDl(false);
    setDlTitle(""); setDlDate(""); setDlProject("");
  };

  const rings = [
    { id: "sleep", label: "Сон", value: state.sleep / 8, display: fmt(state.sleep), sub: "из 8 ч" },
    { id: "namaz", label: "Намаз", value: state.namazTotal ? doneCount / state.namazTotal : 0, display: `${doneCount}/${state.namazTotal}`, sub: "молитв" },
    { id: "move", label: "Движение", value: move.value, display: `${move.minutes}`, sub: `из ${move.goal} мин` },
  ];

  const dueToday = props.deadlines.find((d) => !d.done && d.daysLeft <= 0);
  const sleepAvg = sleepWeek.length ? sleepWeek.reduce((a, b) => a + b.v, 0) / sleepWeek.length : 0;
  const pendingDeadlines = props.deadlines.filter((d) => !d.done);

  return (
    <div className="col" style={{ gap: 18 }}>
      <Hero
        userName={userName}
        subtitle={
          <>
            Спал <b style={{ color: "var(--ink)", fontWeight: 500 }}>{fmt(state.sleep)} ч</b> и{" "}
            <b style={{ color: "var(--ink)", fontWeight: 500 }}>{doneCount} из {state.namazTotal}</b> намазов.{" "}
            {dueToday ? "Один дедлайн ждёт сегодня." : pendingDeadlines.length ? `${pendingDeadlines.length} дедлайнов впереди.` : "Дедлайнов нет."}
          </>
        }
      />

      {/* кольца дня */}
      <Card delay={60}>
        <CardHead label="кольца дня" />
        <div className="row" style={{ justifyContent: "space-around", gap: 8, flexWrap: "wrap" }}>
          {rings.map((r, i) => (
            <div key={r.id} className="col center" style={{ gap: 10 }}>
              <ProgressRing value={r.value} size={96} stroke={8} label={r.display} sublabel={r.sub} delay={i * 140} />
              <span className="t-small" style={{ color: "var(--ink-soft)" }}>{r.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* план дня */}
      {planItems.length > 0 && (
        <Card delay={80}>
          <CardHead label="план дня" />
          <div className="col">
            {planItems.map((p, i) => (
              <div key={p.id}>
                {i > 0 && <hr className="hr" />}
                <div className="task-row" data-done={p.done}>
                  <Checkbox checked={p.done} onChange={() => togglePlan(p.id)} />
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--paper-sunk)", display: "grid", placeItems: "center", color: "var(--ink-soft)", flexShrink: 0 }}>
                    <Icon name={catIcon[p.category] ?? "clock"} size={14} stroke={1.6} />
                  </div>
                  <span className="num t-small" style={{ color: "var(--ink-mute)", flexShrink: 0, minWidth: 36 }}>{p.time}</span>
                  <span className="task-text t-body" style={{ flex: 1, fontWeight: 500 }}>{p.title}</span>
                  {p.duration != null && (
                    <span className="t-small" style={{ color: "var(--ink-mute)", flexShrink: 0 }}>{p.duration} мин</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* задачи */}
      {taskItems.length > 0 && (
        <Card delay={100}>
          <CardHead label="задачи" />
          <div className="col">
            {taskItems.map((t, i) => (
              <div key={t.id}>
                {i > 0 && <hr className="hr" />}
                <div className="task-row" data-done={t.done}>
                  <Checkbox checked={t.done} onChange={() => toggleTask(t.id)} />
                  <span className="task-text t-body" style={{ flex: 1, fontWeight: 500 }}>{t.title}</span>
                  {t.project && <Badge variant="neutral">{t.project}</Badge>}
                  {t.urgent && <Icon name="energy" size={15} stroke={1.8} style={{ color: "var(--accent)", flexShrink: 0 }} />}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid2">
        {/* намаз с галочками */}
        <Card id="namaz" delay={120}>
          <CardHead label="намаз" />
          <div className="col">
            {prayers.map((p, i) => (
              <div key={p.key}>
                {i > 0 && <hr className="hr" />}
                <div className="task-row" data-done={p.done}>
                  <Checkbox checked={p.done} onChange={() => togglePrayer(p.key)} />
                  <span className="task-text t-body" style={{ flex: 1, fontWeight: 500 }}>{p.name}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* дедлайны */}
        <Card delay={160}>
          <CardHead
            label="дедлайны"
            action="все"
            right={
              <button
                className="link-action"
                onClick={() => setShowAddDl((v) => !v)}
                style={{ marginRight: 4 }}
                aria-label="добавить дедлайн"
              >
                <Icon name="plus" size={14} stroke={2} />
              </button>
            }
          />
          <div className="col" style={{ gap: 12 }}>
            {deadlines.length === 0 && !showAddDl && (
              <p className="t-small" style={{ color: "var(--ink-mute)" }}>Дедлайнов нет.</p>
            )}
            {deadlines.map((d) => {
              const variant = d.done ? "success" : d.daysLeft < 0 ? "danger" : d.daysLeft <= 1 ? "accent" : "neutral";
              const icon = d.done ? "check" : d.daysLeft < 0 ? "alert" : d.daysLeft <= 1 ? "clock" : "calendar";
              return (
                <div key={d.id} className="task-row" data-done={d.done} style={{ alignItems: "flex-start", gap: 12, padding: 0 }}>
                  <Checkbox checked={d.done} onChange={() => toggleDl(d.id)} />
                  <div className="col" style={{ flex: 1, gap: 5 }}>
                    <span className="task-text t-body" style={{ fontWeight: 500, lineHeight: 1.3 }}>{d.title}</span>
                    <Badge variant={variant} icon={icon}>{d.done ? "готово" : d.due}</Badge>
                  </div>
                </div>
              );
            })}
            {showAddDl && (
              <form onSubmit={handleAddDeadline} className="col" style={{ gap: 8, marginTop: deadlines.length ? 4 : 0, padding: "12px", background: "var(--paper-sunk)", borderRadius: 10 }}>
                <input
                  style={inputStyle}
                  placeholder="Название дедлайна"
                  value={dlTitle}
                  onChange={(e) => setDlTitle(e.target.value)}
                  required
                  autoFocus
                />
                <input
                  type="date"
                  style={inputStyle}
                  value={dlDate}
                  onChange={(e) => setDlDate(e.target.value)}
                  required
                />
                <input
                  style={inputStyle}
                  placeholder="Проект (необязательно)"
                  value={dlProject}
                  onChange={(e) => setDlProject(e.target.value)}
                />
                <div className="row" style={{ gap: 8, marginTop: 4 }}>
                  <button
                    type="submit"
                    style={{ padding: "8px 16px", background: "var(--accent)", color: "var(--paper)", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Добавить
                  </button>
                  <button
                    type="button"
                    className="link-action"
                    onClick={() => { setShowAddDl(false); setDlTitle(""); setDlDate(""); setDlProject(""); }}
                  >
                    Отмена
                  </button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>

      {/* сон за неделю */}
      <Card delay={200}>
        <CardHead label="сон за неделю" action="трекер" />
        <div className="row center" style={{ gap: 10, marginBottom: 18 }}>
          <span className="num" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 28, color: "var(--ink)" }}>
            {sleepWeek.length ? `${fmt(Math.round(sleepAvg * 10) / 10)} ч` : "—"}
          </span>
          <span className="t-small" style={{ color: "var(--ink-mute)" }}>в среднем · цель 8 ч</span>
        </div>
        <AreaChart data={sleepWeek} goal={8} height={150} />
      </Card>

      {/* лента дня */}
      <Card delay={240}>
        <CardHead label="лента дня" />
        {feed.length === 0 ? (
          <p className="t-small" style={{ color: "var(--ink-mute)" }}>Пока пусто — события появятся, когда бот начнёт записывать день.</p>
        ) : (
          <div className="col">
            {feed.map((f, i) => (
              <div key={i} className="row" style={{ gap: 14 }}>
                <div className="col center" style={{ width: 30 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--paper-sunk)", display: "grid", placeItems: "center", color: "var(--ink-soft)", flexShrink: 0 }}>
                    <Icon name={f.icon} size={16} stroke={1.6} />
                  </div>
                  {i < feed.length - 1 && <div style={{ width: 1.5, flex: 1, minHeight: 18, background: "var(--line)", margin: "4px 0" }} />}
                </div>
                <div className="col" style={{ paddingBottom: i < feed.length - 1 ? 16 : 0, flex: 1 }}>
                  <div className="row center" style={{ gap: 8 }}>
                    {f.t && <span className="num t-small" style={{ color: "var(--ink-mute)" }}>{f.t}</span>}
                    <span className="t-body" style={{ fontWeight: 500 }}>{f.text}</span>
                  </div>
                  {f.meta && <span className="t-small" style={{ color: "var(--ink-soft)", marginTop: 2 }}>{f.meta}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
