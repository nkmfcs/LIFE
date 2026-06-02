"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addExercise } from "@/lib/actions";

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

const DAYS = [
  { label: "Пн", value: 1 },
  { label: "Ср", value: 3 },
  { label: "Пт", value: 5 },
];

export default function AddExerciseForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [day, setDay] = useState("1");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const reset = () => { setName(""); setSets(""); setReps(""); setNotes(""); setDay("1"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await addExercise(
      name.trim(),
      sets ? parseInt(sets) : null,
      reps.trim() || null,
      parseInt(day),
      notes.trim() || null,
      null,
    );
    setOpen(false);
    reset();
    setLoading(false);
    router.refresh();
  };

  if (!open) {
    return (
      <div style={{ marginTop: 16, textAlign: "center" }}>
        <button className="link-action" onClick={() => setOpen(true)}>+ добавить упражнение</button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="col"
      style={{ gap: 8, marginTop: 16, padding: 12, background: "var(--paper-sunk)", borderRadius: 10 }}
    >
      <input
        style={inp}
        placeholder="Название упражнения"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        autoFocus
      />
      <div className="row" style={{ gap: 8 }}>
        <input
          type="number"
          style={{ ...inp, flex: 1 }}
          placeholder="Подходы"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          min={1}
        />
        <input
          style={{ ...inp, flex: 1 }}
          placeholder="Повторения (8-12)"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>
      <select style={inp} value={day} onChange={(e) => setDay(e.target.value)}>
        {DAYS.map((d) => (
          <option key={d.value} value={String(d.value)}>{d.label}</option>
        ))}
      </select>
      <textarea
        style={{ ...inp, resize: "vertical", minHeight: 60 }}
        placeholder="Заметки (необязательно)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="row" style={{ gap: 8, marginTop: 4 }}>
        <button type="submit" style={btnPrimary} disabled={loading}>
          {loading ? "Сохранение..." : "Добавить"}
        </button>
        <button type="button" className="link-action" onClick={() => { setOpen(false); reset(); }}>
          Отмена
        </button>
      </div>
    </form>
  );
}
