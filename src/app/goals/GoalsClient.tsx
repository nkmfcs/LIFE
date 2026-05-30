"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, Card, CardHead, ProgressRing, Badge } from "@/components/ui";
import { addGoal as addGoalAction } from "@/lib/actions";

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

type Goal = {
  id: number; title: string; description: string;
  target: number | null; current: number; unit: string;
  deadline: string | null; progress: number; status: string;
};

type Tab = "active" | "done" | "archive";
const TAB_LABELS: Record<Tab, string> = { active: "Активные", done: "Выполненные", archive: "Архив" };

export default function GoalsClient({
  active,
  done,
  archive,
}: {
  active: Goal[];
  done: Goal[];
  archive: Goal[];
}) {
  const [tab, setTab] = useState<Tab>("active");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("");
  const [deadline, setDeadline] = useState("");

  const lists: Record<Tab, Goal[]> = { active, done, archive };
  const goals = lists[tab];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addGoalAction(
      title.trim(),
      description.trim() || undefined,
      target ? parseFloat(target) : undefined,
      unit.trim() || undefined,
      deadline || undefined,
    );
    setShowForm(false);
    setTitle(""); setDescription(""); setTarget(""); setUnit(""); setDeadline("");
  };

  return (
    <>
      <PageTitle title="Цели" />
      <div className="col" style={{ gap: 18 }}>
        <Card delay={40}>
          <div className="row between center" style={{ flexWrap: "wrap", gap: 12 }}>
            <div className="seg">
              {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
                <button key={t} data-on={t === tab ? "true" : "false"} onClick={() => setTab(t)}>
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
            <button className="link-action" onClick={() => setShowForm((v) => !v)}>
              + новая цель
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleSubmit}
              className="col"
              style={{ gap: 8, marginTop: 16, padding: 12, background: "var(--paper-sunk)", borderRadius: 10 }}
            >
              <input
                style={inp}
                placeholder="Название цели"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
              <textarea
                style={{ ...inp, resize: "vertical", minHeight: 60 }}
                placeholder="Описание (необязательно)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="row" style={{ gap: 8 }}>
                <input
                  type="number"
                  step="any"
                  style={{ ...inp, flex: 1 }}
                  placeholder="Числовая цель"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
                <input
                  style={{ ...inp, flex: 1 }}
                  placeholder="Единица (кг, км…)"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
              <input
                type="date"
                style={inp}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
              <div className="row" style={{ gap: 8, marginTop: 4 }}>
                <button type="submit" style={btnPrimary}>Создать</button>
                <button type="button" className="link-action" onClick={() => setShowForm(false)}>Отмена</button>
              </div>
            </form>
          )}
        </Card>

        {goals.length === 0 && (
          <Card delay={80}>
            <p className="t-small" style={{ color: "var(--ink-mute)" }}>
              {tab === "active" ? "Активных целей нет." : tab === "done" ? "Выполненных целей нет." : "Архив пуст."}
            </p>
          </Card>
        )}

        {goals.map((g, idx) => (
          <Card key={g.id} delay={80 + idx * 30}>
            <div className="row center" style={{ gap: 16 }}>
              {g.target != null && (
                <ProgressRing
                  value={g.progress / 100}
                  size={72}
                  stroke={6}
                  label={`${g.progress}%`}
                  delay={idx * 100}
                />
              )}
              <div style={{ flex: 1 }}>
                <div className="row center" style={{ gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <p className="t-body" style={{ fontWeight: 600 }}>{g.title}</p>
                  {g.status === "done" && <Badge variant="success">выполнено</Badge>}
                  {g.deadline && <Badge variant="neutral" icon="calendar">{g.deadline}</Badge>}
                </div>
                {g.description && (
                  <p className="t-small" style={{ color: "var(--ink-soft)", marginBottom: 6, lineHeight: 1.5 }}>
                    {g.description}
                  </p>
                )}
                {g.target != null && (
                  <>
                    <div style={{ height: 6, background: "var(--paper-sunk)", borderRadius: 4, overflow: "hidden", marginTop: 8 }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${g.progress}%`,
                          background: "var(--accent)",
                          borderRadius: 4,
                          transition: "width 0.8s var(--ease)",
                        }}
                      />
                    </div>
                    <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 5 }}>
                      {g.current} → {g.target} {g.unit}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
