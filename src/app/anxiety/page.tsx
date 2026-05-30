import { getAnxietyData } from "@/lib/queries";
import AnxietyClient from "./AnxietyClient";

export const dynamic = "force-dynamic";

export default async function AnxietyPage() {
  const data = await getAnxietyData();
  return <AnxietyClient {...data} />;
}
