import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/queries";

const SECRET = process.env.API_SECRET ?? "";

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { date, level, thought, trigger } = await req.json();
  const userId = await getUserId();
  const d = new Date(date);
  await prisma.lf_anxiety.create({
    data: {
      user_id: userId,
      date: d,
      level,
      thought,
      trigger: trigger ?? null,
    },
  });
  return NextResponse.json({ ok: true });
}
