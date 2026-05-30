import { getGoalsData } from "@/lib/queries";
import GoalsClient from "./GoalsClient";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const data = await getGoalsData();
  return <GoalsClient {...data} />;
}
