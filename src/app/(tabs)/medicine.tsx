import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, View } from "react-native";
import {
  deleteAllHealthData,
  deleteReminder,
  listReminders,
  saveReminder,
} from "@/db/repository";
import fa from "@/i18n/fa.json";
import { formatMessage } from "@/i18n/format";
import { jalaliDateLabel, localTimeLabel, toIsoDate } from "@/lib/dates";
import {
  cancelMedicationNotifications,
  scheduleMedication,
} from "@/lib/notifications";
import { queryClient } from "@/lib/query";
import {
  Button,
  Card,
  ChoiceGroup,
  Colors,
  DateField,
  Field,
  Styles,
  Text,
  Toast,
} from "@/ui";

const intervals = ["4", "6", "8", "12", "24"] as const;

export function Medicine() {
  const [medication, setMedication] = useState("");
  const [interval, setInterval] = useState<string>("8");
  const [firstDate, setFirstDate] = useState(toIsoDate());
  const [firstTime, setFirstTime] = useState("09:00");

  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["medication-reminders"],
    queryFn: listReminders,
  });
  const addMutation = useMutation({
    mutationFn: async () => {
      const name = medication.trim();
      if (!name) throw new Error(fa.profile.reminderNameRequired);
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(firstTime))
        throw new Error(fa.profile.invalidTime);
      const intervalHours = Number(interval);
      const firstDoseAt = new Date(
        `${firstDate}T${firstTime}:00`,
      ).toISOString();
      const notificationId = await scheduleMedication(
        name,
        intervalHours,
        firstDoseAt,
      );
      try {
        await saveReminder({
          medicationName: name,
          intervalHours,
          firstDoseAt,
          notificationId,
        });
      } catch (error) {
        await cancelMedicationNotifications(notificationId);
        throw error;
      }
    },
    onSuccess: async () => {
      setMedication("");
      await queryClient.invalidateQueries({
        queryKey: ["medication-reminders"],
      });
      Toast({ text: fa.profile.reminderSavedMessage });
    },
  });
  const removeMutation = useMutation({
    mutationFn: async (reminder: (typeof reminders)[number]) => {
      await cancelMedicationNotifications(reminder.notificationId);
      await deleteReminder(reminder.id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["medication-reminders"] }),
  });

  const confirmDelete = (reminder: (typeof reminders)[number]) => {
    Alert.alert(
      fa.profile.deleteReminderTitle,
      formatMessage(fa.profile.deleteReminderQuestion, {
        name: reminder.medicationName,
      }),
      [
        { text: fa.common.cancel, style: "cancel" },
        {
          text: fa.common.delete,
          style: "destructive",
          onPress: () => removeMutation.mutate(reminder),
        },
      ],
    );
  };

  return (
    <>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.profile.medicationReminder}</Text>
        <Field
          label={fa.profile.medicationName}
          value={medication}
          onChangeText={setMedication}
          placeholder={fa.profile.medicationPlaceholder}
        />
        <ChoiceGroup
          label={fa.profile.repeatEvery}
          options={intervals}
          value={interval}
          onChange={(value) => setInterval(value as string)}
        />
        <DateField
          label={fa.profile.firstDoseDate}
          value={firstDate}
          onChange={setFirstDate}
        />
        <Field
          label={fa.profile.firstDoseTime}
          value={firstTime}
          onChangeText={setFirstTime}
          placeholder="09:00"
        />
        <Button
          title={
            addMutation.isPending
              ? fa.profile.settingReminder
              : fa.profile.setReminder
          }
          onPress={() => addMutation.mutate()}
          disabled={addMutation.isPending || !medication.trim()}
        />
        {addMutation.error ? (
          <Text style={{ color: Colors.danger }}>
            {addMutation.error.message}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.profile.activeReminders}</Text>
        {reminders.length ? (
          reminders.map((reminder) => (
            <View
              key={reminder.id}
              style={{
                gap: 8,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: Colors.border,
              }}
            >
              <Text
                style={{
                  color: Colors.ink,
                  fontWeight: "700",
                }}
              >
                {reminder.medicationName}
              </Text>
              <Text style={{ color: Colors.muted }}>
                {formatMessage(fa.profile.everyHours, {
                  hours: reminder.intervalHours,
                  date: jalaliDateLabel(new Date(reminder.firstDoseAt)),
                  time: localTimeLabel(new Date(reminder.firstDoseAt)),
                })}
              </Text>
              <Button
                title={fa.profile.deleteReminder}
                secondary
                onPress={() => confirmDelete(reminder)}
              />
            </View>
          ))
        ) : (
          <Text style={Styles.subtitle}>{fa.profile.noReminders}</Text>
        )}
        {removeMutation.error ? (
          <Text style={{ color: Colors.danger }}>
            {formatMessage(fa.profile.deleteReminderFailed, {
              error: removeMutation.error.message,
            })}
          </Text>
        ) : null}
      </Card>
    </>
  );
}
