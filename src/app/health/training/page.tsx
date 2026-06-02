import { PageTitle, Card, CardHead } from "@/components/ui";
import { getWorkoutPlan, getTrainingData } from "@/lib/queries";
import AddExerciseForm from "./AddExerciseForm";
import WorkoutPlanClient from "./WorkoutPlanClient";
import TrainingClient from "./TrainingClient";

export const dynamic = "force-dynamic";

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
          <WorkoutPlanClient plan={workoutPlan} />
          <AddExerciseForm />
        </Card>

        {/* Блок 2 — история тренировок */}
        <TrainingClient
          all={trainingData.all}
          thisWeekCount={trainingData.thisWeekCount}
          weekGoal={trainingData.weekGoal}
        />

      </div>
    </>
  );
}
