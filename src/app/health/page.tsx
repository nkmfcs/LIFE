import { getHealthData } from "@/lib/queries";
import HealthClient from "./HealthClient";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  const data = await getHealthData();
  return <HealthClient {...data} />;
}
