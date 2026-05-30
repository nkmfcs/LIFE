import { prisma } from "@/lib/prisma";

// ============================================================
// LIFE WEB — слой запросов к Postgres.
// Source of truth: Postgres (см. PROJECTS/LIFE_WEB/00-Архитектура.md).
// ============================================================

// Текущий пользователь. Сейчас один (Анвар, telegram_id=1).
// Когда появится auth — заменить на сессию.
export async function getUserId(): Promise<number> {
  const user = await prisma.lf_user.findUnique({ where: { telegram_id: BigInt(1) } });
  if (!user) throw new Error("Пользователь не найден. Запусти npm run db:seed");
  return user.id;
}

// Имя пользователя из БД (с фолбэком).
export async function getUserName(): Promise<string> {
  const user = await prisma.lf_user.findUnique({ where: { telegram_id: BigInt(1) } });
  return user?.name ?? user?.username ?? "Друг";
}

// Часовой пояс пользователя/бота: Узбекистан (UTC+5).
// Поле date в схеме — @db.Date. Берём календарный день по UZ
// и кладём его UTC-полночью — ровно так, как пишет seed/бот.
const TZ_OFFSET_HOURS = 5;

function startOfToday(): Date {
  const now = new Date();
  const uz = new Date(now.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return new Date(Date.UTC(uz.getUTCFullYear(), uz.getUTCMonth(), uz.getUTCDate()));
}

export function todayDate(): Date { return startOfToday(); }

function formatTime(d: Date): string {
  const uz = new Date(d.getTime() + TZ_OFFSET_HOURS * 3600 * 1000);
  return `${String(uz.getUTCHours()).padStart(2, "0")}:${String(uz.getUTCMinutes()).padStart(2, "0")}`;
}

// 5 молитв (порядок и названия)
export const PRAYERS = [
  { key: "fajr", name: "Фаджр" },
  { key: "zuhr", name: "Зухр" },
  { key: "asr", name: "Аср" },
  { key: "maghrib", name: "Магриб" },
  { key: "isha", name: "Иша" },
] as const;

// ---- Главная страница ----
export async function getTodayData() {
  const userId = await getUserId();
  const today = startOfToday();
  const userName = await getUserName();

  const [sleep, namaz, health, foods, deadlines, sleepWeekRows, training, diary, planRows, taskRows] = await Promise.all([
    prisma.lf_sleep.findUnique({ where: { user_id_date: { user_id: userId, date: today } } }),
    prisma.lf_namaz.findUnique({ where: { user_id_date: { user_id: userId, date: today } } }),
    prisma.lf_health.findUnique({ where: { user_id_date: { user_id: userId, date: today } } }),
    prisma.lf_food.findMany({ where: { user_id: userId, date: today }, orderBy: { time: "asc" } }),
    // Берём ближайшие дедлайны (включая выполненные за последние 3 дня, чтобы галка не пропадала сразу)
    prisma.lf_deadline.findMany({
      where: {
        user_id: userId,
        OR: [
          { done: false },
          { done: true, done_at: { gte: new Date(Date.now() - 3 * 86400000) } },
        ],
      },
      orderBy: [{ done: "asc" }, { due_date: "asc" }],
      take: 5,
    }),
    prisma.lf_sleep.findMany({ where: { user_id: userId }, orderBy: { date: "desc" }, take: 7 }),
    prisma.lf_training.findMany({ where: { user_id: userId, date: today } }),
    prisma.lf_diary.findFirst({ where: { user_id: userId, date: today } }),
    prisma.lf_plan_item.findMany({ where: { user_id: userId, date: today }, orderBy: { time: "asc" } }),
    prisma.lf_task.findMany({ where: { user_id: userId, date: today }, orderBy: { id: "asc" } }),
  ]);

  const namazFlags = {
    fajr: namaz?.fajr ?? false, zuhr: namaz?.zuhr ?? false, asr: namaz?.asr ?? false,
    maghrib: namaz?.maghrib ?? false, isha: namaz?.isha ?? false,
  };
  const namazDone = Object.values(namazFlags).filter(Boolean).length;
  const calories = foods.reduce((sum, f) => sum + f.calories, 0);

  // Движение: суммарные минуты тренировок сегодня, цель 60.
  const moveMinutes = training.reduce((s, t) => s + (t.duration ?? 0), 0);
  const moveGoal = 60;

  // Сон за неделю — от старых к новым (для графика).
  const sleepWeek = [...sleepWeekRows].reverse().map((s) => ({ l: shortWeekday(s.date), v: s.hours }));

  // Лента дня — из реальных событий.
  type FeedItem = { t: string; icon: string; text: string; meta: string | null; sort: number };
  const feed: FeedItem[] = [];
  for (const f of foods) {
    feed.push({ t: formatTime(f.time), icon: "utensils", text: f.item, meta: `${f.calories} ккал`, sort: f.time.getTime() });
  }
  for (const t of training) {
    feed.push({ t: "", icon: "dumbbell", text: "Тренировка", meta: `${t.duration} мин · ${t.type}`, sort: Number.MAX_SAFE_INTEGER - 2 });
  }
  if (diary?.content) {
    feed.push({ t: "", icon: "pen", text: "Запись в дневнике", meta: diary.content.slice(0, 60), sort: Number.MAX_SAFE_INTEGER - 1 });
  }
  feed.sort((a, b) => a.sort - b.sort);

  return {
    userName,
    state: {
      sleep: sleep?.hours ?? 0,
      namazDone,
      namazTotal: 5,
      calories,
      energy: health?.energy ?? 0,
    },
    namazPrayers: PRAYERS.map((p) => ({ key: p.key, name: p.name, done: namazFlags[p.key] })),
    sleepWeek,
    move: { minutes: moveMinutes, goal: moveGoal, value: Math.min(moveMinutes / moveGoal, 1) },
    feed: feed.map((f) => ({ t: f.t, icon: f.icon, text: f.text, meta: f.meta })),
    deadlines: deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      due: formatDue(d.due_date),
      daysLeft: daysUntil(d.due_date),
      project: d.project ?? "",
      done: d.done,
    })),
    plan: planRows.map((p) => ({
      id: p.id,
      time: p.time,
      title: p.title,
      category: p.category,
      duration: p.duration ?? null,
      done: p.done,
    })),
    tasks: taskRows.map((t) => ({
      id: t.id,
      title: t.title,
      project: t.project ?? "",
      urgent: t.urgent,
      done: t.done,
    })),
  };
}

// ---- Дневник ----
export async function getDiaryData() {
  const userId = await getUserId();
  const entries = await prisma.lf_diary.findMany({
    where: { user_id: userId },
    orderBy: { date: "desc" },
    take: 30,
  });

  const moods = entries.filter((e) => e.mood != null).map((e) => e.mood as number);
  const avgMood = moods.length ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;

  return {
    entries: entries.map((e) => ({
      date: formatDate(e.date),
      weekday: formatWeekday(e.date),
      preview: e.content,
      mood: e.mood ?? 0,
      hasVoice: e.has_voice,
      hasPhoto: e.has_photo,
    })),
    summary: {
      count: entries.length,
      avgMood: avgMood.toFixed(1),
      voice: entries.filter((e) => e.has_voice).length,
      photo: entries.filter((e) => e.has_photo).length,
    },
  };
}

// ---- Здоровье ----
export async function getHealthData() {
  const userId = await getUserId();

  const [sleep, weight, foods, namazRows, training] = await Promise.all([
    prisma.lf_sleep.findMany({ where: { user_id: userId }, orderBy: { date: "asc" }, take: 30 }),
    prisma.lf_weight.findMany({ where: { user_id: userId }, orderBy: { date: "asc" }, take: 30 }),
    prisma.lf_food.findMany({ where: { user_id: userId }, orderBy: { date: "asc" } }),
    prisma.lf_namaz.findMany({ where: { user_id: userId }, orderBy: { date: "desc" }, take: 7 }),
    prisma.lf_training.findMany({ where: { user_id: userId }, orderBy: { date: "desc" }, take: 6 }),
  ]);

  const calByDay = new Map<string, number>();
  for (const f of foods) {
    const k = f.date.toISOString().slice(0, 10);
    calByDay.set(k, (calByDay.get(k) ?? 0) + f.calories);
  }

  return {
    sleepHistory: sleep.map((s) => ({ date: shortDate(s.date), hours: s.hours })),
    weightHistory: weight.map((w) => ({ date: shortDate(w.date), kg: w.kg })),
    caloriesHistory: Array.from(calByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ date: shortDate(new Date(k)), kcal: v })),
    namazWeek: [...namazRows].reverse().map((n) => ({
      date: shortWeekday(n.date),
      done: [n.fajr, n.zuhr, n.asr, n.maghrib, n.isha].filter(Boolean).length,
    })),
    trainingHistory: training.map((t) => ({
      type: t.type,
      intensity: t.intensity,
      date: shortDate(t.date),
      duration: t.duration,
    })),
  };
}

// ---- Проекты ----
export async function getProjectsData() {
  const userId = await getUserId();
  const [goals, deadlines] = await Promise.all([
    prisma.lf_goal.findMany({ where: { user_id: userId }, orderBy: { id: "asc" } }),
    prisma.lf_deadline.findMany({ where: { user_id: userId, done: false }, orderBy: { due_date: "asc" } }),
  ]);

  return {
    projects: goals.map((g) => ({
      key: String(g.id),
      name: g.title,
      next: g.description ?? "",
      status: g.status === "active" ? "warn" : "ok",
      icon: "Heart",
    })),
    goals: goals
      .filter((g) => g.target != null)
      .map((g) => ({
        id: g.id,
        title: g.title,
        progress: g.target ? Math.round(((g.current ?? 0) / g.target) * 100) : 0,
        current: g.current ?? 0,
        target: g.target ?? 0,
        unit: g.unit ?? "",
      })),
    deadlines: deadlines.map((d) => ({
      id: d.id,
      title: d.title,
      due: formatDue(d.due_date),
      daysLeft: daysUntil(d.due_date),
      project: d.project ?? "",
    })),
  };
}

// ---- Сон ----
export async function getSleepData() {
  const userId = await getUserId();
  const today = startOfToday();
  const rows = await prisma.lf_sleep.findMany({
    where: { user_id: userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  const last7 = rows.slice(0, 7).map((r) => r.hours);
  const avg7 = last7.length ? Math.round((last7.reduce((a, b) => a + b, 0) / last7.length) * 10) / 10 : 0;
  const todayRow = rows.find((r) => r.date.getTime() === today.getTime()) ?? null;
  return {
    avg7,
    today: todayRow
      ? { hours: todayRow.hours, from_time: todayRow.from_time ?? null, to_time: todayRow.to_time ?? null }
      : null,
    history: rows.slice(0, 14).map((s) => ({ date: formatDate(s.date), hours: s.hours })),
    chartData: [...rows].reverse().map((s) => ({ l: shortDate(s.date), v: s.hours })),
  };
}

// ---- Вес ----
export async function getWeightData() {
  const userId = await getUserId();
  const rows = await prisma.lf_weight.findMany({
    where: { user_id: userId },
    orderBy: { date: "desc" },
    take: 30,
  });
  const latest = rows[0]?.kg ?? null;
  const prev = rows[1]?.kg ?? null;
  const trend: "up" | "down" | "flat" =
    latest != null && prev != null ? (latest > prev ? "up" : latest < prev ? "down" : "flat") : "flat";
  const weightGoal = await prisma.lf_goal.findFirst({
    where: { user_id: userId, title: { contains: "вес", mode: "insensitive" } },
  });
  return {
    latest,
    trend,
    goal:
      weightGoal && weightGoal.target != null
        ? { target: weightGoal.target, current: weightGoal.current ?? 0, unit: weightGoal.unit ?? "кг" }
        : null,
    history: rows.slice(0, 14).map((w) => ({ date: formatDate(w.date), kg: w.kg })),
    chartData: [...rows].reverse().map((w) => ({ l: shortDate(w.date), v: w.kg })),
  };
}

// ---- Питание ----
export async function getFoodData() {
  const userId = await getUserId();
  const today = startOfToday();
  const fourteenDaysAgo = new Date(today.getTime() - 13 * 86400000);
  const thirtyDaysAgo = new Date(today.getTime() - 29 * 86400000);

  const [todayFoods, recentFoods, monthFoods] = await Promise.all([
    prisma.lf_food.findMany({ where: { user_id: userId, date: today }, orderBy: { time: "asc" } }),
    prisma.lf_food.findMany({ where: { user_id: userId, date: { gte: fourteenDaysAgo } }, orderBy: { date: "asc" } }),
    prisma.lf_food.findMany({ where: { user_id: userId, date: { gte: thirtyDaysAgo } } }),
  ]);

  const calByDay = new Map<string, number>();
  for (const f of recentFoods) {
    const k = f.date.toISOString().slice(0, 10);
    calByDay.set(k, (calByDay.get(k) ?? 0) + f.calories);
  }

  const itemCount = new Map<string, number>();
  for (const f of monthFoods) itemCount.set(f.item, (itemCount.get(f.item) ?? 0) + 1);
  const topItems = Array.from(itemCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([item, count]) => ({ item, count }));

  return {
    todayCalories: todayFoods.reduce((s, f) => s + f.calories, 0),
    todayGoal: 2000,
    todayFoods: todayFoods.map((f) => ({ time: formatTime(f.time), item: f.item, calories: f.calories })),
    calByDay: Array.from(calByDay.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ l: shortDate(new Date(k)), v })),
    topItems,
  };
}

// ---- Намаз (расширенный) ----
export async function getNamazData() {
  const userId = await getUserId();
  const today = startOfToday();
  const [todayNamaz, rows] = await Promise.all([
    prisma.lf_namaz.findUnique({ where: { user_id_date: { user_id: userId, date: today } } }),
    prisma.lf_namaz.findMany({ where: { user_id: userId }, orderBy: { date: "desc" }, take: 30 }),
  ]);

  const namazFlags = {
    fajr: todayNamaz?.fajr ?? false,
    zuhr: todayNamaz?.zuhr ?? false,
    asr: todayNamaz?.asr ?? false,
    maghrib: todayNamaz?.maghrib ?? false,
    isha: todayNamaz?.isha ?? false,
  };

  const uzNow = new Date(Date.now() + TZ_OFFSET_HOURS * 3600 * 1000);
  const monthStart = new Date(Date.UTC(uzNow.getUTCFullYear(), uzNow.getUTCMonth(), 1));
  const monthRows = rows.filter((r) => r.date >= monthStart);
  const monthDone = monthRows.reduce(
    (s, r) => s + [r.fajr, r.zuhr, r.asr, r.maghrib, r.isha].filter(Boolean).length,
    0,
  );
  const monthPossible = monthRows.length * 5;

  let streak = 0;
  for (const r of rows) {
    if ([r.fajr, r.zuhr, r.asr, r.maghrib, r.isha].filter(Boolean).length === 5) streak++;
    else break;
  }

  return {
    todayPrayers: PRAYERS.map((p) => ({ key: p.key, name: p.name, done: namazFlags[p.key] })),
    monthStats: {
      done: monthDone,
      total: monthPossible,
      pct: monthPossible ? Math.round((monthDone / monthPossible) * 100) : 0,
    },
    streak,
    last14: rows
      .slice(0, 14)
      .reverse()
      .map((r) => ({
        date: formatDate(r.date),
        weekday: shortWeekday(r.date),
        done: [r.fajr, r.zuhr, r.asr, r.maghrib, r.isha].filter(Boolean).length,
      })),
    barsData: [...rows].reverse().map((r) => ({
      l: shortWeekday(r.date),
      v: [r.fajr, r.zuhr, r.asr, r.maghrib, r.isha].filter(Boolean).length,
      accent: [r.fajr, r.zuhr, r.asr, r.maghrib, r.isha].filter(Boolean).length === 5,
    })),
  };
}

// ---- Тренировки ----
export async function getTrainingData() {
  const userId = await getUserId();
  const today = startOfToday();
  const rows = await prisma.lf_training.findMany({
    where: { user_id: userId },
    orderBy: { date: "desc" },
  });
  const dow = today.getDay();
  const monday = new Date(today.getTime() + (dow === 0 ? -6 : 1 - dow) * 86400000);
  return {
    all: rows.map((t) => ({
      type: t.type,
      duration: t.duration,
      intensity: t.intensity,
      date: formatDate(t.date),
      notes: t.notes ?? null,
    })),
    thisWeekCount: rows.filter((r) => r.date >= monday).length,
    weekGoal: 3,
  };
}

// ---- Цели (расширенные) ----
export async function getGoalsData() {
  const userId = await getUserId();
  const rows = await prisma.lf_goal.findMany({ where: { user_id: userId }, orderBy: { id: "asc" } });
  const mapGoal = (g: (typeof rows)[number]) => ({
    id: g.id,
    title: g.title,
    description: g.description ?? "",
    target: g.target,
    current: g.current ?? 0,
    unit: g.unit ?? "",
    deadline: g.deadline ? formatDue(g.deadline) : null,
    progress: g.target ? Math.round(((g.current ?? 0) / g.target) * 100) : 0,
    status: g.status,
  });
  return {
    active: rows.filter((g) => g.status === "active").map(mapGoal),
    done: rows.filter((g) => g.status === "done").map(mapGoal),
    archive: rows.filter((g) => g.status !== "active" && g.status !== "done").map(mapGoal),
  };
}

// ---- Дедлайны (с фильтром) ----
export async function getDeadlinesData(filter?: string) {
  const userId = await getUserId();
  const today = startOfToday();
  const rows = await prisma.lf_deadline.findMany({
    where: {
      user_id: userId,
      ...(filter === "today"
        ? { due_date: { lte: new Date(today.getTime() + 86400000) }, done: false }
        : filter === "week"
          ? { due_date: { lte: new Date(today.getTime() + 7 * 86400000) }, done: false }
          : filter === "overdue"
            ? { due_date: { lt: today }, done: false }
            : {}),
    },
    orderBy: [{ done: "asc" }, { due_date: "asc" }],
  });
  return rows.map((d) => ({
    id: d.id,
    title: d.title,
    project: d.project ?? "",
    due: formatDue(d.due_date),
    daysLeft: daysUntil(d.due_date),
    done: d.done,
  }));
}

// ---- Тревоги ----
export async function getAnxietyData() {
  const userId = await getUserId();
  const rows = await prisma.lf_anxiety.findMany({ where: { user_id: userId }, orderBy: { date: "desc" } });
  const triggerCount = new Map<string, number>();
  let totalLevel = 0;
  for (const r of rows) {
    if (r.trigger) triggerCount.set(r.trigger, (triggerCount.get(r.trigger) ?? 0) + 1);
    totalLevel += r.level;
  }
  const topTrigger = Array.from(triggerCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  return {
    entries: rows.map((r) => ({
      id: r.id,
      date: formatDate(r.date),
      level: r.level,
      thought: r.thought,
      trigger: r.trigger ?? null,
    })),
    patterns:
      rows.length > 0 ? { topTrigger, avgLevel: (totalLevel / rows.length).toFixed(1) } : null,
  };
}

// ---- Настройки ----
export async function getSettingsData() {
  const user = await prisma.lf_user.findUnique({ where: { telegram_id: BigInt(1) } });
  return {
    name: user?.name ?? user?.username ?? "Друг",
    telegramId: user?.telegram_id?.toString() ?? "—",
  };
}

// ---- хелперы дат ----
const MONTHS = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
const WEEKDAYS = ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"];
const WEEKDAYS_SHORT = ["вс","пн","вт","ср","чт","пт","сб"];

function formatDate(d: Date) { return `${d.getDate()} ${MONTHS[d.getMonth()]}`; }
function formatWeekday(d: Date) { return WEEKDAYS[d.getDay()]; }
function shortDate(d: Date) { return `${d.getDate()}.${d.getMonth() + 1}`; }
function shortWeekday(d: Date) { return WEEKDAYS_SHORT[d.getDay()]; }
function daysUntil(d: Date) {
  return Math.round((d.getTime() - startOfToday().getTime()) / 86400000);
}
function formatDue(d: Date) {
  const days = daysUntil(d);
  if (days === 0) return "сегодня";
  if (days === 1) return "завтра";
  if (days < 0) return "просрочено";
  return `${formatDate(d)} · через ${days} дн`;
}
