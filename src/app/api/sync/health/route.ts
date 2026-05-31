import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, energy, mood } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  const e = energy ?? 0;
  const m = mood ?? 0;
  await prisma.lf_health.upsert({
    where: { user_id_date: { user_id: userId, date: d } },
    update: { energy: e, mood: m },
    create: { user_id: userId, date: d, energy: e, mood: m },
  });
  return NextResponse.json({ ok: true });
}
