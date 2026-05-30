import Anthropic from "@anthropic-ai/sdk";
import { getTodayData } from "@/lib/queries";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function buildContext(): Promise<string> {
  try {
    const d = await getTodayData();
    const sleep7 = d.sleepWeek.map((s) => `${s.l}:${s.v}ч`).join(", ");
    const deadlines = d.deadlines
      .filter((dl) => !dl.done)
      .slice(0, 3)
      .map((dl) => `"${dl.title}" (${dl.due})`)
      .join("; ");
    const namaz = `${d.state.namazDone}/5 сегодня`;
    const sleep = `${d.state.sleep} ч сегодня`;
    return `Данные пользователя: сон сегодня ${sleep}, намаз ${namaz}, сон за 7 дней [${sleep7}], дедлайны: ${deadlines || "нет"}.`;
  } catch {
    return "Данные пользователя недоступны.";
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const message: string = body.message ?? "";
  const history: { role: "user" | "assistant"; content: string }[] = body.history ?? [];

  if (!message) {
    return Response.json({ error: "message required" }, { status: 400 });
  }

  const context = await buildContext();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `Ты персональный ассистент по здоровью и продуктивности. Отвечай кратко и по делу на русском языке. ${context}`,
    messages: [
      ...history,
      { role: "user", content: message },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "Нет ответа.";
  return Response.json({ text });
}
