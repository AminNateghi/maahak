import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon, TrashIcon } from "lucide-react-native";
import { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import {
  deleteBloodPressureEntry,
  listBloodPressureEntries,
  saveBloodPressureEntry,
} from "@/db/repository";
import fa from "@/i18n/fa.json";
import {
  jalaliDateLabel,
  localTimeLabel,
  toIsoDate,
  toPersianDigits,
} from "@/lib/dates";
import {
  Button,
  Card,
  ChoiceGroup,
  DateField,
  Field,
  Notice,
  Page,
  Text,
  TimeField,
  Toast,
} from "@/ui";
import { ConfirmationDialog } from "@/ui/confirmation-dialog";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

const contextOptions = [
  "none",
  "before_breakfast",
  "after_breakfast",
  "before_lunch",
  "after_lunch",
  "before_dinner",
  "after_dinner",
  "before_exercise",
  "after_exercise",
] as const;

type ContextOption = (typeof contextOptions)[number];

function contextLabel(value: string) {
  if (value === "none") return null;
  return value in fa.bloodPressure.contextOptions
    ? fa.bloodPressure.contextOptions[value as ContextOption]
    : null;
}

export default function BloodPressureScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [deleteDialog, setDeleteDialog] = useState<{
    id: number;
    visible: boolean;
  }>({ id: 0, visible: false });
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [context, setContext] = useState<ContextOption>("none");
  const [note, setNote] = useState("");
  const [entryDate, setEntryDate] = useState(toIsoDate());
  const [entryTime, setEntryTime] = useState(localTimeLabel(new Date()));
  const { data: entries = [] } = useQuery({
    queryKey: ["blood-pressure-entries"],
    queryFn: listBloodPressureEntries,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const parsedSystolic = Number(systolic);
      const parsedDiastolic = Number(diastolic);
      if (
        !Number.isInteger(parsedSystolic) ||
        parsedSystolic < 40 ||
        parsedSystolic > 300
      )
        throw new Error(fa.bloodPressure.systolicRange);
      if (
        !Number.isInteger(parsedDiastolic) ||
        parsedDiastolic < 20 ||
        parsedDiastolic > 200
      )
        throw new Error(fa.bloodPressure.diastolicRange);
      if (parsedSystolic <= parsedDiastolic)
        throw new Error(fa.bloodPressure.invalidRelation);
      await saveBloodPressureEntry({
        entryDate,
        entryTime,
        systolic: parsedSystolic,
        diastolic: parsedDiastolic,
        context,
        note: note.trim(),
      });
    },
    onSuccess: async () => {
      setSystolic("");
      setDiastolic("");
      setContext("none");
      setNote("");
      await queryClient.invalidateQueries({
        queryKey: ["blood-pressure-entries"],
      });
      Toast({ text: fa.common.saved });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await deleteBloodPressureEntry(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blood-pressure-entries"] });
      setDeleteDialog({ id: deleteDialog.id, visible: false });
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.bloodPressure.title,
      headerTitleAlign: "center",
      headerLeft: () => <></>,
      headerRight: () => (
        <IconButton icon={<ArrowRightIcon />} onPress={() => router.back()} />
      ),
    });
  }, [navigation]);

  return (
    <Page>
      <Notice tone="description">{fa.bloodPressure.subtitle}</Notice>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.bloodPressure.addReading}</Text>
        <DateField
          label={fa.bloodPressure.date}
          value={entryDate}
          onChange={setEntryDate}
          maximumDate={new Date()}
        />
        <TimeField
          label={fa.bloodPressure.time}
          value={entryTime}
          onChange={setEntryTime}
        />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Field
              label={fa.bloodPressure.systolic}
              value={systolic}
              onChangeText={setSystolic}
              keyboardType="number-pad"
              placeholder="120"
              maxLength={3}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Field
              label={fa.bloodPressure.diastolic}
              value={diastolic}
              onChangeText={setDiastolic}
              keyboardType="number-pad"
              placeholder="80"
              maxLength={3}
            />
          </View>
        </View>
        <ChoiceGroup
          label={fa.bloodPressure.context}
          options={contextOptions}
          value={context}
          onChange={(value) => setContext(value as ContextOption)}
          getLabel={(value) => fa.bloodPressure.contextOptions[value]}
        />
        <Field
          label={fa.bloodPressure.note}
          value={note}
          onChangeText={setNote}
          placeholder={fa.bloodPressure.notePlaceholder}
          multiline
        />
        <Button
          title={
            addMutation.isPending
              ? fa.common.saving
              : `${fa.bloodPressure.saveReading}  ${jalaliDateLabel(new Date(`${entryDate}T12:00:00`), "D MMMM")}`
          }
          onPress={() => addMutation.mutate()}
          disabled={addMutation.isPending || !systolic || !diastolic}
        />
        {addMutation.error ? (
          <Text style={{ color: Colors.danger }}>
            {addMutation.error.message}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.bloodPressure.history}</Text>
        {entries.length === 0 && (
          <Text style={Styles.subtitle}>{fa.bloodPressure.noEntries}</Text>
        )}
        {entries
          .slice()
          .reverse()
          .map((entry) => {
            const label = contextLabel(entry.context);
            return (
              <View
                key={entry.id}
                style={{
                  gap: 5,
                  paddingVertical: 9,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: Colors.ink,
                      fontWeight: "700",
                      fontSize: 16,
                    }}
                  >
                    {toPersianDigits(entry.systolic)}/
                    {toPersianDigits(entry.diastolic)}{" "}
                    <Text
                      style={{
                        color: Colors.muted,
                        fontWeight: "400",
                        fontSize: 12,
                      }}
                    >
                      {fa.bloodPressure.unit}
                    </Text>
                  </Text>
                  <IconButton
                    icon={<TrashIcon color={Colors.primary} />}
                    onPress={() =>
                      setDeleteDialog({ id: entry.id, visible: true })
                    }
                  />
                </View>
                <Text style={{ color: Colors.muted }}>
                  {jalaliDateLabel(
                    new Date(`${entry.entryDate}T12:00:00`),
                    "D MMMM",
                  )}{" "}
                  · {toPersianDigits(entry.entryTime)}
                  {label ? ` · ${label}` : ""}
                </Text>
                {entry.note ? (
                  <Text style={{ color: Colors.ink }}>{entry.note}</Text>
                ) : null}
              </View>
            );
          })}
      </Card>
      <Notice tone="neutral">{fa.bloodPressure.disclaimer}</Notice>
      <ConfirmationDialog
        visible={deleteDialog.visible}
        message={fa.bloodPressure.deleteMessage}
        onConfirm={() => removeMutation.mutate(deleteDialog.id)}
        onCancel={() =>
          setDeleteDialog({ id: deleteDialog.id, visible: false })
        }
      />
    </Page>
  );
}
