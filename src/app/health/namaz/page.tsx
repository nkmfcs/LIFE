import { PageTitle } from "@/components/ui";
import { getNamazData } from "@/lib/queries";
import NamazClient from "./NamazClient";

export const dynamic = "force-dynamic";

export default async function NamazPage() {
  const data = await getNamazData();
  return (
    <>
      <PageTitle title="Намаз" />
      <NamazClient {...data} />
    </>
  );
}
