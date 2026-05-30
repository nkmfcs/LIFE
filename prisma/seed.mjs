// Наполнение БД начальными данными.
// Запуск: npm run db:seed (после db:push)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.lf_user.upsert({
    where: { telegram_id: BigInt(1) },
    update: {},
    create: { telegram_id: BigInt(1), username: "anvar", name: "Анвар" },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // План дня
  const plan = [
    { time: "05:00", title: "Фаджр + подъём", category: "morning", done: true },
    { time: "08:00", title: "Работа · LIFE WEB", category: "work", done: false },
    { time: "13:00", title: "Зухр · обед", category: "food", done: false },
    { time: "18:00", title: "Тренировка · силовая", category: "sport", duration: 45, done: false },
    { time: "22:00", title: "Иша · дневник · сон", category: "evening", done: false },
  ];
  for (const p of plan) {
    await prisma.lf_plan_item.create({ data: { user_id: user.id, date: today, ...p } });
  }

  // Задачи
  const tasks = [
    { title: "Закончить архитектуру LIFE WEB", project: "LIFE WEB", urgent: false, done: true },
    { title: "Доделать дизайн дашборда", project: "LIFE WEB", urgent: false, done: false },
    { title: "Налоги ИП — подать", project: "PROKAT", urgent: true, done: false },
  ];
  for (const t of tasks) {
    await prisma.lf_task.create({ data: { user_id: user.id, date: today, ...t } });
  }

  await prisma.lf_sleep.create({ data: { user_id: user.id, date: today, from_time: "22:15", to_time: "06:00", hours: 7.7 } });
  await prisma.lf_weight.create({ data: { user_id: user.id, date: today, kg: 78.5 } });
  await prisma.lf_namaz.create({ data: { user_id: user.id, date: today, fajr: true, zuhr: true, asr: true } });
  await prisma.lf_health.create({ data: { user_id: user.id, date: today, mood: 8, energy: 8 } });

  console.log("✓ Seed выполнен. Пользователь:", user.name);
}

main().catch(console.error).finally(() => prisma.$disconnect());
