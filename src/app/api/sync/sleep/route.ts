import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, hours, from_time, to_time } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  await prisma.lf_sleep.upsert({
    where: { user_id_date: { user_id: userId, date: d } },
    update: { hours, from_time: from_time ?? null, to_time: to_time ?? null },
    create: { user_id: userId, date: d, hours, from_time: from_time ?? null, to_time: to_time ?? null },
  });
  return NextResponse.json({ ok: true });
}
