import * as Notifications from "expo-notifications";
import { listReminders, updateReminderNotifications } from "@/db/repository";
import type { MedicationReminder } from "@/db/schema";
import fa from "@/i18n/fa.json";

type Dose = { id: string; at: string };
const dosesToSchedule = 60;
const refreshThreshold = 15;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function scheduleMedication(
  medicationName: string,
  intervalHours: number,
  firstDoseAt: string,
): Promise<string> {
  if (
    !Number.isInteger(intervalHours) ||
    intervalHours < 1 ||
    intervalHours > 24
  ) {
    throw new Error(fa.notifications.invalidInterval);
  }
  const permission = await Notifications.getPermissionsAsync();
  const requested = permission.granted
    ? permission
    : await Notifications.requestPermissionsAsync();
  if (!requested.granted) {
    throw new Error(fa.notifications.permissionDenied);
  }
  await configureAndroidChannel();

  const intervalMs = intervalHours * 60 * 60 * 1000;
  const firstMs = new Date(firstDoseAt).getTime();
  if (!Number.isFinite(firstMs))
    throw new Error(fa.notifications.invalidFirstDose);
  const now = Date.now();
  const offset =
    firstMs > now ? 0 : Math.floor((now - firstMs) / intervalMs) + 1;
  const doses = await scheduleDoses(
    medicationName,
    intervalHours,
    firstMs + offset * intervalMs,
    dosesToSchedule,
  );
  return JSON.stringify(doses);
}

export async function cancelMedicationNotifications(notificationIds: string) {
  const doses = parseDoses(notificationIds);
  for (const dose of doses) {
    await Notifications.cancelScheduledNotificationAsync(dose.id);
  }
}

export async function refreshMedicationNotifications() {
  const reminders = await listReminders();
  if (!reminders.length) return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const activeIds = new Set(scheduled.map((request) => request.identifier));

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    await refreshOneReminder(reminder, activeIds);
  }
}

async function refreshOneReminder(
  reminder: MedicationReminder,
  activeIds: Set<string>,
) {
  const doses = parseDoses(reminder.notificationId).filter((dose) =>
    activeIds.has(dose.id),
  );
  if (doses.length >= refreshThreshold) {
    if (doses.length !== parseDoses(reminder.notificationId).length) {
      await updateReminderNotifications(reminder.id, JSON.stringify(doses));
    }
    return;
  }

  await configureAndroidChannel();
  const intervalMs = reminder.intervalHours * 60 * 60 * 1000;
  const lastActive = doses.reduce(
    (latest, dose) => Math.max(latest, new Date(dose.at).getTime()),
    0,
  );
  const lastStored = parseDoses(reminder.notificationId).reduce(
    (latest, dose) => Math.max(latest, new Date(dose.at).getTime()),
    0,
  );
  const firstDose = new Date(reminder.firstDoseAt).getTime();
  let firstNewDose = Math.max(lastActive, lastStored, firstDose);
  if (firstNewDose <= Date.now()) {
    firstNewDose +=
      (Math.floor((Date.now() - firstNewDose) / intervalMs) + 1) * intervalMs;
  } else {
    firstNewDose += intervalMs;
  }
  const newDoses = await scheduleDoses(
    reminder.medicationName,
    reminder.intervalHours,
    firstNewDose,
    dosesToSchedule,
  );
  try {
    await updateReminderNotifications(
      reminder.id,
      JSON.stringify([...doses, ...newDoses]),
    );
  } catch (error) {
    await cancelMedicationNotifications(JSON.stringify(newDoses));
    throw error;
  }
}

async function scheduleDoses(
  medicationName: string,
  intervalHours: number,
  firstAt: number,
  count: number,
): Promise<Dose[]> {
  const doses: Dose[] = [];
  try {
    for (let index = 0; index < count; index++) {
      const at = new Date(firstAt + index * intervalHours * 60 * 60 * 1000);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: fa.notifications.title,
          body: fa.notifications.body.replace("{name}", medicationName),
          data: { medicationName, intervalHours },
          sound: false,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: at,
          channelId: "medications",
        },
      });
      doses.push({ id, at: at.toISOString() });
    }
  } catch (error) {
    try {
      await Promise.all(
        doses.map((dose) =>
          Notifications.cancelScheduledNotificationAsync(dose.id),
        ),
      );
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Scheduling failed and some already-created notifications could not be canceled.",
      );
    }
    throw error;
  }
  return doses;
}

async function configureAndroidChannel() {
  await Notifications.setNotificationChannelAsync("medications", {
    name: fa.notifications.channel,
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    sound: null,
  });
}

function parseDoses(notificationIds: string): Dose[] {
  const parsed: unknown = JSON.parse(notificationIds);
  if (!Array.isArray(parsed))
    throw new Error(fa.notifications.invalidSavedData);
  return parsed.filter(
    (dose): dose is Dose =>
      typeof dose === "object" &&
      dose !== null &&
      "id" in dose &&
      typeof dose.id === "string" &&
      "at" in dose &&
      typeof dose.at === "string",
  );
}
