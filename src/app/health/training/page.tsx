import { PageTitle } from "@/components/ui";
import { getTrainingData } from "@/lib/queries";
import TrainingClient from "./TrainingClient";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const data = await getTrainingData();
  return (
    <>
      <PageTitle title="Тренировки" />
      <TrainingClient {...data} />
    </>
  );
}
