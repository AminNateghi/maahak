import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  heightCm: real("height_cm").notNull(),
  initialWeightKg: real("initial_weight_kg").notNull(),
  lastPeriodStart: text("last_period_start").notNull(),
  averageCycleDays: integer("average_cycle_days").notNull(),
  periodDurationDays: integer("period_duration_days").notNull(),
  regularity: text("regularity").notNull(),
  premenstrualExperience: text("premenstrual_experience").notNull(),
  pregnancyIntent: text("pregnancy_intent").notNull(),
  healthConditions: text("health_conditions").notNull(),
  createdAt: text("created_at").notNull(),
});

export const periodStarts = sqliteTable("period_starts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  startDate: text("start_date").notNull().unique(),
  createdAt: text("created_at").notNull(),
});

export const dailyLogs = sqliteTable("daily_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  logDate: text("log_date").notNull().unique(),
  mood: text("mood").notNull(),
  symptoms: text("symptoms").notNull(),
  note: text("note").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export const weightEntries = sqliteTable("weight_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entryDate: text("entry_date").notNull().unique(),
  weightKg: real("weight_kg").notNull(),
  createdAt: text("created_at").notNull(),
});

export const medicationReminders = sqliteTable("medication_reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationName: text("medication_name").notNull(),
  intervalHours: integer("interval_hours").notNull(),
  firstDoseAt: text("first_dose_at").notNull(),
  notificationId: text("notification_id").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type DailyLog = typeof dailyLogs.$inferSelect;
export type WeightEntry = typeof weightEntries.$inferSelect;
export type MedicationReminder = typeof medicationReminders.$inferSelect;
