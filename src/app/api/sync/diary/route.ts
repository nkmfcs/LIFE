import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, content, mood } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  const existing = await prisma.lf_diary.findFirst({
    where: { user_id: userId, date: d },
  });
  if (existing) {
    await prisma.lf_diary.update({
      where: { id: existing.id },
      data: { content, mood: mood ?? existing.mood },
    });
  } else {
    await prisma.lf_diary.create({
      data: { user_id: userId, date: d, content, mood: mood ?? null },
    });
  }
  return NextResponse.json({ ok: true });
}
