"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteExercise, updateExercise, reorderExercise } from "@/lib/actions";

type Exercise = {
  id: number;
  name: string;
  sets: number | null;
  reps: string | null;
  photo_url: string | null;
  notes: string | null;
};

const DAYS = [
  { label: "Пн", value: 1 },
  { label: "Ср", value: 3 },
  { label: "Пт", value: 5 },
];

const inp: React.CSSProperties = {
  padding: "6px 8px",
  background: "var(--paper-card)",
  border: "1px solid var(--line)",
  borderRadius: 6,
  fontSize: 13,
  color: "var(--ink)",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
const btnSave: React.CSSProperties = {
  padding: "5px 10px",
  background: "var(--accent)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
const btnIcon: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--ink-mute)",
  padding: "1px 3px",
  fontSize: 13,
  lineHeight: 1,
  flexShrink: 0,
};
const btnIconDisabled: React.CSSProperties = {
  ...btnIcon,
  opacity: 0.25,
  cursor: "default",
};

export default function WorkoutPlanClient({
  plan,
}: {
  plan: Record<number, Exercise[]>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSets, setEditSets] = useState("");
  const [editReps, setEditReps] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const router = useRouter();

  const startEdit = (ex: Exercise) => {
    setEditingId(ex.id);
    setEditName(ex.name);
    setEditSets(ex.sets != null ? String(ex.sets) : "");
    setEditReps(ex.reps ?? "");
    setEditNotes(ex.notes ?? "");
  };

  const handleUpdate = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    await updateExercise(
      id,
      editName.trim(),
      editSets ? parseInt(editSets) : null,
      editReps.trim() || null,
      editNotes.trim() || null,
    );
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    await deleteExercise(id);
    router.refresh();
  };

  const handleReorder = async (id: number, direction: "up" | "down") => {
    await reorderExercise(id, direction);
    router.refresh();
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {DAYS.map(({ label, value: day }) => {
        const exercises = plan[day] ?? [];
        return (
          <div key={day} className="col" style={{ gap: 8 }}>
            <p
              className="t-small"
              style={{
                fontWeight: 600,
                color: "var(--ink-soft)",
                textAlign: "center",
                paddingBottom: 4,
                borderBottom: "1px solid var(--line)",
              }}
            >
              {label}
            </p>

            {exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="col"
                style={{ gap: 4, padding: 8, background: "var(--paper-sunk)", borderRadius: 8 }}
              >
                {editingId === ex.id ? (
                  <form onSubmit={(e) => handleUpdate(e, ex.id)} className="col" style={{ gap: 5 }}>
                    <input
                      style={inp}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Название"
                      required
                      autoFocus
                    />
                    <div className="row" style={{ gap: 5 }}>
                      <input
                        type="number"
                        style={{ ...inp, flex: 1 }}
                        placeholder="Подх."
                        value={editSets}
                        onChange={(e) => setEditSets(e.target.value)}
                        min={1}
                      />
                      <input
                        style={{ ...inp, flex: 1 }}
                        placeholder="Повт."
                        value={editReps}
                        onChange={(e) => setEditReps(e.target.value)}
                      />
                    </div>
                    <textarea
                      style={{ ...inp, resize: "vertical", minHeight: 44 }}
                      placeholder="Заметки"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                    />
                    <div className="row" style={{ gap: 6 }}>
                      <button type="submit" style={btnSave}>Сохранить</button>
                      <button
                        type="button"
                        className="link-action"
                        style={{ fontSize: 12 }}
                        onClick={() => setEditingId(null)}
                      >
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="row" style={{ alignItems: "flex-start", gap: 4 }}>
                      <p className="t-small" style={{ fontWeight: 600, flex: 1 }}>{ex.name}</p>
                      <div className="row" style={{ gap: 0, flexShrink: 0 }}>
                        <button
                          style={idx === 0 ? btnIconDisabled : btnIcon}
                          disabled={idx === 0}
                          onClick={() => handleReorder(ex.id, "up")}
                          title="Вверх"
                        >↑</button>
                        <button
                          style={idx === exercises.length - 1 ? btnIconDisabled : btnIcon}
                          disabled={idx === exercises.length - 1}
                          onClick={() => handleReorder(ex.id, "down")}
                          title="Вниз"
                        >↓</button>
                        <button
                          style={btnIcon}
                          onClick={() => startEdit(ex)}
                          title="Редактировать"
                        >✏️</button>
                        <button
                          style={btnIcon}
                          onClick={() => handleDelete(ex.id)}
                          title="Удалить"
                        >×</button>
                      </div>
                    </div>
                    {(ex.sets || ex.reps) && (
                      <p className="t-micro" style={{ color: "var(--ink-mute)" }}>
                        {ex.sets && ex.reps
                          ? `${ex.sets}×${ex.reps}`
                          : ex.sets
                            ? `${ex.sets} подх.`
                            : ex.reps}
                      </p>
                    )}
                    {ex.notes && (
                      <p className="t-micro" style={{ color: "var(--ink-mute)", fontStyle: "italic" }}>
                        {ex.notes}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            {exercises.length === 0 && (
              <p className="t-micro" style={{ color: "var(--ink-mute)", textAlign: "center" }}>—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
