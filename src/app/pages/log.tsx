import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowRightIcon, CheckIcon } from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { getDailyLog, saveDailyLog } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { toIsoDate } from "@/lib/dates";
import { type SymptomName, symptomGroups } from "@/lib/symptoms";
import {
  Button,
  Card,
  ChoiceGroup,
  DateField,
  Field,
  Notice,
  Page,
  Text,
  Toast,
} from "@/ui";
import { IconButton } from "@/ui/icon-button";
import { Colors } from "@/ui/theme";

export default function DailyLogScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ date?: string }>();
  const queryClient = useQueryClient();
  const today = toIsoDate();
  const [date, setDate] = useState(params.date ?? today);
  const [mood, setMood] = useState<string>("");
  const [symptoms, setSymptoms] = useState<SymptomName[]>([]);
  const [note, setNote] = useState("");
  const { data: existing } = useQuery({
    queryKey: ["daily-log", date],
    queryFn: () => getDailyLog(date),
  });
  const saveMutation = useMutation({
    mutationFn: () => saveDailyLog({ logDate: date, mood, symptoms, note }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["daily-logs"] }),
        queryClient.invalidateQueries({ queryKey: ["daily-log", date] }),
      ]);
      Toast({ text: fa.log.savedMessage });
      router.navigate("/(tabs)/calendar");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.log.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerLeft: () => (
        <IconButton icon={CheckIcon} onPress={() => saveMutation.mutate()} />
      ),
      headerRight: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
    });
  }, [navigation, saveMutation.mutate]);

  useEffect(() => {
    setMood(existing?.mood ?? "");
    setSymptoms(
      existing ? (JSON.parse(existing.symptoms) as SymptomName[]) : [],
    );
    setNote(existing?.note ?? "");
  }, [existing]);

  useEffect(() => {
    if (params.date) setDate(params.date <= today ? params.date : today);
  }, [params.date, today]);

  return (
    <Page>
      <Notice tone="description">{fa.log.disclaimer}</Notice>
      <Card>
        <DateField
          label={fa.log.date}
          value={date}
          onChange={setDate}
          maximumDate={new Date()}
        />
      </Card>
      <Card>
        <ChoiceGroup
          label={fa.log.mood}
          options={fa.symptoms.moods}
          value={mood}
          onChange={(value) => setMood(value as string)}
        />
      </Card>
      {Object.entries(symptomGroups).map(([group, options]) => (
        <Card key={group}>
          <ChoiceGroup
            label={group}
            options={options as readonly SymptomName[]}
            value={symptoms}
            multiple
            onChange={(value) => setSymptoms(value as SymptomName[])}
          />
          <Text style={{ color: Colors.muted, fontSize: 12 }}>
            {fa.log.multipleSelect}
          </Text>
        </Card>
      ))}
      <Field
        label={fa.log.note}
        multiline
        value={note}
        onChangeText={setNote}
        placeholder={fa.log.notePlaceholder}
      />

      {symptoms.some((symptom) =>
        fa.symptoms.medicalAlertTriggers.includes(symptom),
      ) ? (
        <Notice tone="warning">{fa.log.symptomWarning}</Notice>
      ) : null}
      {symptoms.includes(fa.symptoms.unprotectedIntercourse) ? (
        <Notice tone="warning">{fa.log.unprotectedWarning}</Notice>
      ) : null}
      <Button
        title={saveMutation.isPending ? fa.common.saving : fa.common.save}
        onPress={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      />
      {saveMutation.isError ? (
        <Text style={{ color: Colors.danger }}>{fa.common.retry}</Text>
      ) : null}
    </Page>
  );
}
