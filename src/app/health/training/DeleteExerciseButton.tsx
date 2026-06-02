"use client";

import { useRouter } from "next/navigation";
import { deleteExercise } from "@/lib/actions";

export default function DeleteExerciseButton({ id }: { id: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    await deleteExercise(id);
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      title="Удалить"
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "var(--ink-mute)",
        fontSize: 16,
        lineHeight: 1,
        padding: "2px 4px",
        flexShrink: 0,
      }}
    >
      ×
    </button>
  );
}
