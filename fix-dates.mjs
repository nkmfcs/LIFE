import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

// сегодня по Узбекистану (+5), UTC-полночь  как считает приложение
const now = new Date();
const uz = new Date(now.getTime() + 5 * 3600 * 1000);
const today = new Date(Date.UTC(uz.getUTCFullYear(), uz.getUTCMonth(), uz.getUTCDate()));
console.log("Двигаю данные на:", today.toISOString().slice(0, 10));

const u = await p.lf_user.findUnique({ where: { telegram_id: BigInt(1) } });

// 1. убрать возможные дубли плана/задач (оставить по одной копии каждой)
for (const model of ["lf_plan_item", "lf_task"]) {
  const rows = await p[model].findMany({ where: { user_id: u.id }, orderBy: { id: "asc" } });
  const seen = new Set();
  for (const r of rows) {
    const key = r.title;
    if (seen.has(key)) await p[model].delete({ where: { id: r.id } });
    else seen.add(key);
  }
}

// 2. сдвинуть все даты на сегодня
await p.lf_plan_item.updateMany({ where: { user_id: u.id }, data: { date: today } });
await p.lf_task.updateMany({ where: { user_id: u.id }, data: { date: today } });
await p.lf_sleep.updateMany({ where: { user_id: u.id }, data: { date: today } });
await p.lf_weight.updateMany({ where: { user_id: u.id }, data: { date: today } });
await p.lf_namaz.updateMany({ where: { user_id: u.id }, data: { date: today } });
await p.lf_health.updateMany({ where: { user_id: u.id }, data: { date: today } });

const plan = await p.lf_plan_item.count({ where: { user_id: u.id, date: today } });
const tasks = await p.lf_task.count({ where: { user_id: u.id, date: today } });
console.log(`Готово. План: ${plan}, задачи: ${tasks}`);
await p.$disconnect();
