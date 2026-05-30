"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, Card, CardHead, Checkbox, Badge } from "@/components/ui";
import { toggleDeadline as toggleDeadlineAction, addDeadline as addDeadlineAction } from "@/lib/actions";

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

type Deadline = { id: number; title: string; project: string; due: string; daysLeft: number; done: boolean };
type Filter = "all" | "today" | "week" | "overdue";
const FILTER_LABELS: Record<Filter, string> = { all: "Все", today: "Сегодня", week: "Неделя", overdue: "Просрочено" };

export default function DeadlinesClient({
  deadlines: initial,
  filter,
}: {
  deadlines: Deadline[];
  filter: string;
}) {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [project, setProject] = useState("");
  const [, startTransition] = useTransition();

  useEffect(() => setDeadlines(initial), [initial]);

  const toggleDl = (id: number) => {
    const next = !deadlines.find((d) => d.id === id)?.done;
    setDeadlines((ds) => ds.map((x) => (x.id === id ? { ...x, done: next } : x)));
    startTransition(() => { toggleDeadlineAction(id, next); });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    await addDeadlineAction(title.trim(), dueDate, project.trim() || undefined);
    setShowForm(false);
    setTitle(""); setDueDate(""); setProject("");
  };

  const setFilter = (f: Filter) => {
    if (f === "all") router.push("/deadlines");
    else router.push(`/deadlines?filter=${f}`);
  };

  return (
    <>
      <PageTitle title="Дедлайны" />
      <div className="col" style={{ gap: 18 }}>
        <Card delay={40}>
          <div className="row between center" style={{ flexWrap: "wrap", gap: 12 }}>
            <div className="seg">
              {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
                <button key={f} data-on={filter === f ? "true" : "false"} onClick={() => setFilter(f)}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
            <button className="link-action" onClick={() => setShowForm((v) => !v)}>
              + добавить
            </button>
          </div>
          {showForm && (
            <form
              onSubmit={handleAdd}
              className="col"
              style={{ gap: 8, marginTop: 16, padding: 12, background: "var(--paper-sunk)", borderRadius: 10 }}
            >
              <input
                style={inp}
                placeholder="Название"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <input
                type="date"
                style={inp}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <input
                style={inp}
                placeholder="Проект (необязательно)"
                value={project}
                onChange={(e) => setProject(e.target.value)}
              />
              <div className="row" style={{ gap: 8, marginTop: 4 }}>
                <button type="submit" style={btnPrimary}>Добавить</button>
                <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
              </div>
            </form>
          )}
        </Card>

        <Card delay={80}>
          {deadlines.length === 0 && (
            <p className="t-small" style={{ color: "var(--ink-mute)" }}>Дедлайнов нет.</p>
          )}
          <div className="col" style={{ gap: 12 }}>
            {deadlines.map((d) => {
              const variant = d.done ? "success" : d.daysLeft < 0 ? "danger" : d.daysLeft <= 3 ? "accent" : "neutral";
              const icon = d.done ? "check" : d.daysLeft < 0 ? "alert" : d.daysLeft <= 1 ? "clock" : "calendar";
              return (
                <div
                  key={d.id}
                  className="task-row"
                  data-done={d.done}
                  style={{ alignItems: "flex-start", gap: 12, padding: 0 }}
                >
                  <Checkbox checked={d.done} onChange={() => toggleDl(d.id)} />
                  <div className="col" style={{ flex: 1, gap: 5 }}>
                    <span className="task-text t-body" style={{ fontWeight: 500, lineHeight: 1.3 }}>{d.title}</span>
                    <div className="row center" style={{ gap: 8, flexWrap: "wrap" }}>
                      <Badge variant={variant} icon={icon}>{d.done ? "готово" : d.due}</Badge>
                      {d.project && (
                        <span className="t-small" style={{ color: "var(--ink-mute)" }}>{d.project}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
