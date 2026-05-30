import { PageTitle } from "@/components/ui";
import { getWeightData } from "@/lib/queries";
import WeightClient from "./WeightClient";

export const dynamic = "force-dynamic";

export default async function WeightPage() {
  const data = await getWeightData();
  return (
    <>
      <PageTitle title="Вес" />
      <WeightClient {...data} />
    </>
  );
}
