import dayjs from "dayjs";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { getProfile, listPeriodStarts } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { estimateCycle } from "./cycle";
import { buildCycleReminders, pickCycleMessage } from "./cycle-reminders";
import { toIsoDate } from "./dates";

const channelId = "cycle-reminders";
const cyclesToSchedule = 6;

export async function refreshCycleNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  await cancelCycleNotifications();

  const user = await getProfile();
  if (!user) return;

  const [lastPeriod] = await listPeriodStarts();
  if (!lastPeriod) return;

  const estimate = estimateCycle(
    dayjs(lastPeriod.startDate).toISOString(),
    toIsoDate(),
    {
      averageCycleDays: user.averageCycleDays,
      periodDurationDays: user.periodDurationDays,
      regularity:
        user.regularity === "regular" || user.regularity === "irregular"
          ? user.regularity
          : "unknown",
    },
  );
  if (!estimate) return;

  const permission = await Notifications.getPermissionsAsync();
  const requested = permission.granted
    ? permission
    : await Notifications.requestPermissionsAsync();
  if (!requested.granted) return;

  await configureAndroidChannel();
  const reminders = buildCycleReminders(
    estimate,
    user.averageCycleDays,
    new Date(),
    cyclesToSchedule,
  );

  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: fa.notifications.title,
        body: pickCycleMessage(reminder.phase, reminder.timing),
        data: {
          cycleReminder: true,
          phase: reminder.phase,
          timing: reminder.timing,
          date: reminder.date,
        },
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.at,
        channelId,
      },
    });
  }
}

export async function cancelCycleNotifications(): Promise<void> {
  if (Platform.OS === "web") return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const scheduledCycles = scheduled.filter(
    (notification) => notification.content.data?.cycleReminder === true,
  );
  await Promise.all(
    scheduledCycles.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ),
  );

  const presented = await Notifications.getPresentedNotificationsAsync();
  const presentedCycles = presented.filter(
    (notification) => notification.request.content.data?.cycleReminder === true,
  );
  await Promise.all(
    presentedCycles.map((notification) =>
      Notifications.dismissNotificationAsync(notification.request.identifier),
    ),
  );
}

async function configureAndroidChannel() {
  await Notifications.setNotificationChannelAsync(channelId, {
    name: fa.notifications.cycleChannel,
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 200],
    sound: null,
  });
}
