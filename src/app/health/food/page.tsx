import { PageTitle } from "@/components/ui";
import { getFoodData } from "@/lib/queries";
import FoodClient from "./FoodClient";

export const dynamic = "force-dynamic";

export default async function FoodPage() {
  const data = await getFoodData();
  return (
    <>
      <PageTitle title="Питание" />
      <FoodClient {...data} />
    </>
  );
}
