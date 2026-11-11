import { useMutation, useQuery } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect, useState } from "react";
import { Alert, View } from "react-native";
import { deleteReminder, listReminders, saveReminder } from "@/db/repository";
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
  Page,
  Styles,
  Text,
  TimeField,
  Toast,
} from "@/ui";
import { IconButton } from "@/ui/icon-button";

const intervals = ["4", "6", "8", "12", "24"] as const;

export default function MedicineScreen() {
  const navigation = useNavigation();
  const [medication, setMedication] = useState("");
  const [interval, setInterval] = useState<string>("8");
  const [firstDate, setFirstDate] = useState(toIsoDate());
  const [firstTime, setFirstTime] = useState("09:00");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.medicine.title,
      headerLeft: () => <></>,
      headerRight: () => (
        <IconButton icon={<ArrowRightIcon />} onPress={() => router.back()} />
      ),
    });
  }, [navigation]);

  const { data: reminders = [] } = useQuery({
    queryKey: ["medication-reminders"],
    queryFn: listReminders,
  });
  const addMutation = useMutation({
    mutationFn: async () => {
      const name = medication.trim();
      if (!name) throw new Error(fa.medicine.reminderNameRequired);
      if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(firstTime))
        throw new Error(fa.medicine.invalidTime);
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
      Toast({ text: fa.common.saved });
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
      fa.medicine.deleteReminderTitle,
      formatMessage(fa.medicine.deleteReminderQuestion, {
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
    <Page>
      <Card>
        <Text style={Styles.sectionTitle}>
          {fa.medicine.medicationReminder}
        </Text>
        <Field
          label={fa.medicine.medicationName}
          value={medication}
          onChangeText={setMedication}
          placeholder={fa.medicine.medicationPlaceholder}
        />
        <ChoiceGroup
          label={fa.medicine.repeatEvery}
          options={intervals}
          value={interval}
          onChange={(value) => setInterval(value as string)}
        />
        <DateField
          label={fa.medicine.firstDoseDate}
          value={firstDate}
          onChange={setFirstDate}
        />
        <TimeField
          label={fa.medicine.firstDoseTime}
          value={firstTime}
          onChange={setFirstTime}
        />
        <Button
          title={addMutation.isPending ? fa.common.saving : fa.common.save}
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
        <Text style={Styles.sectionTitle}>{fa.medicine.activeReminders}</Text>
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
                {formatMessage(fa.medicine.everyHours, {
                  hours: reminder.intervalHours,
                  date: jalaliDateLabel(new Date(reminder.firstDoseAt)),
                  time: localTimeLabel(new Date(reminder.firstDoseAt)),
                })}
              </Text>
              <Button
                title={fa.medicine.deleteReminder}
                secondary
                onPress={() => confirmDelete(reminder)}
              />
            </View>
          ))
        ) : (
          <Text style={Styles.subtitle}>{fa.medicine.noReminders}</Text>
        )}
        {removeMutation.error ? (
          <Text style={{ color: Colors.danger }}>
            {formatMessage(fa.medicine.deleteReminderFailed, {
              error: removeMutation.error.message,
            })}
          </Text>
        ) : null}
      </Card>
    </Page>
  );
}
