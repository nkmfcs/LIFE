import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, item, calories, time: time_str } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  // time — UTC+5 (Tashkent). If provided parse as local time, else use now.
  const time = time_str
    ? new Date(`${date}T${time_str}:00+05:00`)
    : new Date();
  await prisma.lf_food.create({
    data: { user_id: userId, date: d, time, item, calories: calories ?? 0 },
  });
  return NextResponse.json({ ok: true });
}
