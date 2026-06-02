"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUserId, todayDate } from "@/lib/queries";

// Отметить/снять молитву за сегодня. Создаёт строку lf_namaz если её ещё нет.
const PRAYER_KEYS = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const;
type PrayerKey = (typeof PRAYER_KEYS)[number];

export async function toggleNamaz(prayer: string, done: boolean) {
  if (!PRAYER_KEYS.includes(prayer as PrayerKey)) return;
  const userId = await getUserId();
  const date = todayDate();
  const fields: { fajr?: boolean; zuhr?: boolean; asr?: boolean; maghrib?: boolean; isha?: boolean } = {};
  (fields as Record<string, boolean>)[prayer] = done;
  await prisma.lf_namaz.upsert({
    where: { user_id_date: { user_id: userId, date } },
    update: fields,
    create: { user_id: userId, date, ...fields },
  });
  revalidatePath("/");
}

export async function toggleDeadline(id: number, done: boolean) {
  await prisma.lf_deadline.update({
    where: { id },
    data: { done, done_at: done ? new Date() : null },
  });
  revalidatePath("/");
  revalidatePath("/projects");
}

export async function togglePlanItem(id: number, done: boolean) {
  await prisma.lf_plan_item.update({ where: { id }, data: { done } });
  revalidatePath("/");
}

export async function toggleTask(id: number, done: boolean) {
  await prisma.lf_task.update({ where: { id }, data: { done } });
  revalidatePath("/");
}

export async function addSleep(fromTime: string, toTime: string) {
  const userId = await getUserId();
  const date = todayDate();
  const [fh, fm] = fromTime.split(":").map(Number);
  const [th, tm] = toTime.split(":").map(Number);
  const fromMins = fh * 60 + fm;
  let toMins = th * 60 + tm;
  if (toMins <= fromMins) toMins += 24 * 60;
  const hours = Math.round(((toMins - fromMins) / 60) * 10) / 10;
  await prisma.lf_sleep.upsert({
    where: { user_id_date: { user_id: userId, date } },
    update: { from_time: fromTime, to_time: toTime, hours },
    create: { user_id: userId, date, from_time: fromTime, to_time: toTime, hours },
  });
  revalidatePath("/health/sleep");
  revalidatePath("/");
}

export async function addWeight(kg: number) {
  const userId = await getUserId();
  const date = todayDate();
  await prisma.lf_weight.upsert({
    where: { user_id_date: { user_id: userId, date } },
    update: { kg },
    create: { user_id: userId, date, kg },
  });
  revalidatePath("/health/weight");
  revalidatePath("/");
}

export async function addFood(item: string, calories: number, time: string, composition?: string) {
  const userId = await getUserId();
  const date = todayDate();
  const [h, m] = time.split(":").map(Number);
  const timeDate = new Date(date.getTime() + (h * 60 + m) * 60 * 1000);
  await prisma.lf_food.create({
    data: { user_id: userId, date, time: timeDate, item, calories, composition: composition ?? null },
  });
  revalidatePath("/health/food");
  revalidatePath("/");
}

export async function addExercise(
  name: string,
  sets: number | null,
  reps: string | null,
  dayOfWeek: number,
  notes: string | null,
  photoUrl: string | null,
) {
  const userId = await getUserId();
  const exercise = await prisma.lf_exercise.create({
    data: { user_id: userId, name, sets, reps, notes, photo_url: photoUrl },
  });
  await prisma.lf_workout_plan.create({
    data: { user_id: userId, day_of_week: dayOfWeek, exercise_id: exercise.id },
  });
  revalidatePath("/health/training");
}

export async function deleteExercise(id: number) {
  await prisma.lf_workout_plan.deleteMany({ where: { exercise_id: id } });
  await prisma.lf_exercise.delete({ where: { id } });
  revalidatePath("/health/training");
}

export async function addAnxiety(level: number, thought: string, trigger?: string) {
  const userId = await getUserId();
  await prisma.lf_anxiety.create({
    data: { user_id: userId, level, thought, trigger: trigger ?? null },
  });
  revalidatePath("/anxiety");
}

export async function addDiaryEntry(content: string, mood: number) {
  const userId = await getUserId();
  const date = todayDate();
  await prisma.lf_diary.create({
    data: { user_id: userId, date, content, mood },
  });
  revalidatePath("/diary");
}

export async function addGoal(
  title: string,
  description?: string,
  target?: number,
  unit?: string,
  deadline?: string,
) {
  const userId = await getUserId();
  await prisma.lf_goal.create({
    data: {
      user_id: userId,
      title,
      description: description ?? null,
      target: target ?? null,
      unit: unit ?? null,
      deadline: deadline ? new Date(deadline) : null,
    },
  });
  revalidatePath("/goals");
  revalidatePath("/projects");
}

export async function addTraining(type: string, duration: number, intensity: string, notes?: string) {
  const userId = await getUserId();
  const date = todayDate();
  await prisma.lf_training.create({
    data: { user_id: userId, date, type, duration, intensity, notes: notes ?? null },
  });
  revalidatePath("/health/training");
  revalidatePath("/");
}

export async function addDeadline(title: string, dueDate: string, project?: string) {
  const userId = await getUserId();
  await prisma.lf_deadline.create({
    data: {
      user_id: userId,
      title,
      due_date: new Date(dueDate),
      project: project ?? null,
    },
  });
  revalidatePath("/");
  revalidatePath("/projects");
}
