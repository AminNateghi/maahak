import { desc, eq } from "drizzle-orm";
import { toIsoDate } from "@/lib/dates";
import { db } from "./client";
import {
  dailyLogs,
  medicationReminders,
  type NewProfile,
  periodStarts,
  profile,
  weightEntries,
} from "./schema";

export async function getProfile() {
  const [row] = await db.select().from(profile).limit(1);
  return row ?? null;
}

export async function saveProfile(value: Omit<NewProfile, "id">) {
  await db.transaction(async (tx) => {
    const [current] = await tx.select().from(profile).limit(1);
    if (current) {
      await tx.update(profile).set(value).where(eq(profile.id, current.id));
    } else {
      await tx.insert(profile).values(value);
    }
    await tx
      .insert(periodStarts)
      .values({ startDate: value.lastPeriodStart, createdAt: value.createdAt })
      .onConflictDoNothing();
    await tx
      .insert(weightEntries)
      .values({
        entryDate: toIsoDate(),
        weightKg: value.initialWeightKg,
        createdAt: value.createdAt,
      })
      .onConflictDoUpdate({
        target: weightEntries.entryDate,
        set: { weightKg: value.initialWeightKg, createdAt: value.createdAt },
      });
  });
}

export async function listPeriodStarts() {
  return db
    .select()
    .from(periodStarts)
    .orderBy(desc(periodStarts.startDate))
    .all();
}

export async function addPeriodStart(startDate: string) {
  await db.transaction(async (tx) => {
    await tx
      .insert(periodStarts)
      .values({ startDate, createdAt: new Date().toISOString() })
      .onConflictDoNothing();
    const [current] = await tx.select().from(profile).limit(1);
    if (current && startDate > current.lastPeriodStart) {
      await tx
        .update(profile)
        .set({ lastPeriodStart: startDate })
        .where(eq(profile.id, current.id));
    }
  });
}

export async function listDailyLogs() {
  return db.select().from(dailyLogs).orderBy(desc(dailyLogs.logDate)).all();
}

export async function getDailyLog(date: string) {
  const [row] = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.logDate, date))
    .limit(1);
  return row ?? null;
}

export async function saveDailyLog(input: {
  logDate: string;
  mood: string;
  symptoms: string[];
  note: string;
}) {
  const existing = await getDailyLog(input.logDate);
  const value = {
    ...input,
    symptoms: JSON.stringify(input.symptoms),
    createdAt: new Date().toISOString(),
  };
  if (existing) {
    await db.update(dailyLogs).set(value).where(eq(dailyLogs.id, existing.id));
  } else {
    await db.insert(dailyLogs).values(value);
  }
}

export async function listWeightEntries() {
  return db.select().from(weightEntries).orderBy(weightEntries.entryDate).all();
}

export async function saveWeightEntry(entryDate: string, weightKg: number) {
  await db
    .insert(weightEntries)
    .values({ entryDate, weightKg, createdAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: weightEntries.entryDate,
      set: { weightKg, createdAt: new Date().toISOString() },
    });
}

export async function listReminders() {
  return db
    .select()
    .from(medicationReminders)
    .orderBy(desc(medicationReminders.createdAt))
    .all();
}

export async function saveReminder(input: {
  medicationName: string;
  intervalHours: number;
  firstDoseAt: string;
  notificationId: string;
}) {
  const [row] = await db
    .insert(medicationReminders)
    .values({
      ...input,
      enabled: true,
      createdAt: new Date().toISOString(),
    })
    .returning({ id: medicationReminders.id });
  return row.id;
}

export async function updateReminderNotifications(
  id: number,
  notificationId: string,
) {
  await db
    .update(medicationReminders)
    .set({ notificationId })
    .where(eq(medicationReminders.id, id));
}

export async function deleteReminder(id: number) {
  await db.delete(medicationReminders).where(eq(medicationReminders.id, id));
}

export async function deleteAllHealthData() {
  await db.transaction(async (tx) => {
    await tx.delete(medicationReminders);
    await tx.delete(weightEntries);
    await tx.delete(dailyLogs);
    await tx.delete(periodStarts);
    await tx.delete(profile);
  });
}
