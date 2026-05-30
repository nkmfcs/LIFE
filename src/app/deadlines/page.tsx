import { getDeadlinesData } from "@/lib/queries";
import DeadlinesClient from "./DeadlinesClient";

export const dynamic = "force-dynamic";

export default async function DeadlinesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : undefined;
  const deadlines = await getDeadlinesData(filter);
  return <DeadlinesClient deadlines={deadlines} filter={filter ?? "all"} />;
}
