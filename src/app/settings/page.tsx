import { getSettingsData } from "@/lib/queries";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const data = await getSettingsData();
  return <SettingsClient {...data} />;
}
