import fa from "@/i18n/fa.json";
import type { CycleEstimate } from "./cycle";
import { addDays } from "./dates";

export type CyclePhase = "period" | "pms";
export type CycleTiming = "tomorrow" | "today";

export type CycleMessageKey = {
  phase: CyclePhase;
  timing: CycleTiming;
};

export type CycleReminder = CycleMessageKey & {
  date: string;
  at: Date;
};

export const cycleReminderHour = 7;
export const cycleReminderMinute = 30;

const cycleReminderTime = `${String(cycleReminderHour).padStart(2, "0")}:${String(
  cycleReminderMinute,
).padStart(2, "0")}:00`;

export function buildCycleReminders(
  estimate: CycleEstimate,
  averageCycleDays: number,
  now: Date,
  cycleCount = 6,
): CycleReminder[] {
  const reminders: CycleReminder[] = [];
  for (let index = 0; index < cycleCount; index++) {
    const periodStart = addDays(
      estimate.nextPeriodStart,
      index * averageCycleDays,
    );
    const pmsStart = addDays(estimate.pmsStart, index * averageCycleDays);
    const events = [
      { phase: "period" as const, date: periodStart },
      { phase: "pms" as const, date: pmsStart },
    ];

    for (const event of events) {
      for (const timing of ["tomorrow", "today"] as const) {
        const day =
          timing === "tomorrow" ? addDays(event.date, -1) : event.date;
        const at = new Date(`${day}T${cycleReminderTime}`);
        if (at.getTime() > now.getTime()) {
          reminders.push({ ...event, timing, date: event.date, at });
        }
      }
    }
  }
  return reminders;
}

export function getCycleMessageKey(
  estimate: CycleEstimate,
  today: string,
): CycleMessageKey | null {
  if (today === estimate.periodStart || today === estimate.nextPeriodStart) {
    return { phase: "period", timing: "today" };
  }
  if (today === addDays(estimate.nextPeriodStart, -1)) {
    return { phase: "period", timing: "tomorrow" };
  }
  if (today === estimate.pmsStart) {
    return { phase: "pms", timing: "today" };
  }
  if (today === addDays(estimate.pmsStart, -1)) {
    return { phase: "pms", timing: "tomorrow" };
  }
  return null;
}

export function getCycleMessages(
  phase: CyclePhase,
  timing: CycleTiming,
): readonly string[] {
  return fa.cycleMessages[phase][timing];
}

export function pickCycleMessage(
  phase: CyclePhase,
  timing: CycleTiming,
): string {
  const messages = getCycleMessages(phase, timing);
  return messages[Math.floor(Math.random() * messages.length)];
}
