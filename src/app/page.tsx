import { getTodayData } from "@/lib/queries";
import TodayClient from "./TodayClient";

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const data = await getTodayData();
  return <TodayClient {...data} />;
}
