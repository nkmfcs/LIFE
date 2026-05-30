import { PageTitle } from "@/components/ui";
import { getDiaryData } from "@/lib/queries";
import DiaryClient from "./DiaryClient";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
  const data = await getDiaryData();
  return (
    <>
      <PageTitle title="Дневник" />
      <DiaryClient {...data} />
    </>
  );
}
