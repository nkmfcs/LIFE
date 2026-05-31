import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, fajr, zuhr, asr, maghrib, isha } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  await prisma.lf_namaz.upsert({
    where: { user_id_date: { user_id: userId, date: d } },
    update: { fajr, zuhr, asr, maghrib, isha },
    create: { user_id: userId, date: d, fajr, zuhr, asr, maghrib, isha },
  });
  return NextResponse.json({ ok: true });
}
