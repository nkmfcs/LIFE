import { PageTitle, Card, CardHead } from "@/components/ui";
import { getWorkoutPlan, getTrainingData } from "@/lib/queries";
import AddExerciseForm from "./AddExerciseForm";
import DeleteExerciseButton from "./DeleteExerciseButton";
import TrainingClient from "./TrainingClient";

export const dynamic = "force-dynamic";

const DAY_LABELS: Record<number, string> = { 1: "Пн", 3: "Ср", 5: "Пт" };
const PLAN_DAYS = [1, 3, 5];

export default async function TrainingPage() {
  const [workoutPlan, trainingData] = await Promise.all([
    getWorkoutPlan(),
    getTrainingData(),
  ]);

  return (
    <>
      <PageTitle title="Тренировки" />
      <div className="col" style={{ gap: 18 }}>

        {/* Блок 1 — план недели */}
        <Card delay={40}>
          <CardHead label="план недели" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {PLAN_DAYS.map((day) => {
              const exercises = workoutPlan[day] ?? [];
              return (
                <div key={day} className="col" style={{ gap: 8 }}>
                  <p
                    className="t-small"
                    style={{ fontWeight: 600, color: "var(--ink-soft)", textAlign: "center", paddingBottom: 4, borderBottom: "1px solid var(--line)" }}
                  >
                    {DAY_LABELS[day]}
                  </p>
                  {exercises.map((ex) => (
                    <div
                      key={ex.id}
                      className="col"
                      style={{ gap: 4, padding: 8, background: "var(--paper-sunk)", borderRadius: 8 }}
                    >
                      <div className="row between" style={{ alignItems: "flex-start" }}>
                        <p className="t-small" style={{ fontWeight: 600, flex: 1 }}>{ex.name}</p>
                        <DeleteExerciseButton id={ex.id} />
                      </div>
                      {ex.photo_url && (
                        <img
                          src={ex.photo_url}
                          alt={ex.name}
                          width={80}
                          height={80}
                          style={{ borderRadius: 6, objectFit: "cover", display: "block" }}
                        />
                      )}
                      {(ex.sets || ex.reps) && (
                        <p className="t-micro" style={{ color: "var(--ink-mute)" }}>
                          {ex.sets && ex.reps ? `${ex.sets}×${ex.reps}` : ex.sets ? `${ex.sets} подх.` : ex.reps}
                        </p>
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
          <AddExerciseForm />
        </Card>

        {/* Блок 2 — история тренировок */}
        <TrainingClient all={trainingData.all} thisWeekCount={trainingData.thisWeekCount} weekGoal={trainingData.weekGoal} />

      </div>
    </>
  );
}
