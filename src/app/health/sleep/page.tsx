import { PageTitle } from "@/components/ui";
import { getSleepData } from "@/lib/queries";
import SleepClient from "./SleepClient";

export const dynamic = "force-dynamic";

export default async function SleepPage() {
  const data = await getSleepData();
  return (
    <>
      <PageTitle title="Сон" />
      <SleepClient {...data} />
    </>
  );
}
