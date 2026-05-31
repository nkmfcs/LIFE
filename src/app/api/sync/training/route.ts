import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, type, duration, intensity, notes } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  await prisma.lf_training.create({
    data: {
      user_id: userId,
      date: d,
      type,
      duration: duration ?? 0,
      intensity: intensity ?? "normal",
      notes: notes ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}
