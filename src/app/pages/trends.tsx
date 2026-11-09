import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
import {
  getProfile,
  listWeightEntries,
  saveWeightEntry,
} from "@/db/repository";
import fa from "@/i18n/fa.json";
import { formatMessage } from "@/i18n/format";
import { jalaliDateLabel, toIsoDate, toPersianDigits } from "@/lib/dates";
import {
  Button,
  Card,
  DateField,
  Field,
  Notice,
  Page,
  Text,
  Toast,
} from "@/ui";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

const chartWidth = 320;
const chartHeight = 180;

export default function TrendsScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [weight, setWeight] = useState("");
  const [entryDate, setEntryDate] = useState(toIsoDate());
  const { data: entries = [] } = useQuery({
    queryKey: ["weight-entries"],
    queryFn: listWeightEntries,
  });
  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const addMutation = useMutation({
    mutationFn: async () => {
      const parsed = Number(weight);
      if (!Number.isFinite(parsed) || parsed < 20 || parsed > 300)
        throw new Error(fa.trends.weightRange);
      await saveWeightEntry(entryDate, parsed);
    },
    onSuccess: async () => {
      setWeight("");
      await queryClient.invalidateQueries({ queryKey: ["weight-entries"] });
      Toast({ text: fa.common.saved });
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.trends.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerLeft: () => <></>,
      headerRight: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
    });
  }, [navigation]);

  const min = entries.length
    ? Math.min(...entries.map((entry) => entry.weightKg))
    : 0;
  const max = entries.length
    ? Math.max(...entries.map((entry) => entry.weightKg))
    : 0;
  const span = max - min || 1;
  const points = entries
    .map((entry, index) => {
      const x =
        entries.length === 1
          ? chartWidth / 2
          : 18 + (index * (chartWidth - 36)) / (entries.length - 1);
      const y =
        chartHeight - 28 - ((entry.weightKg - min) / span) * (chartHeight - 56);
      return `${x},${y}`;
    })
    .join(" ");
  const change =
    entries.length > 1
      ? entries[entries.length - 1].weightKg - entries[0].weightKg
      : 0;

  return (
    <Page>
      <Notice tone="description">{fa.trends.subtitle}</Notice>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.trends.chart}</Text>
        {entries.length ? (
          <>
            <Svg
              width="100%"
              height={chartHeight}
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            >
              <Line
                x1="12"
                y1={chartHeight - 28}
                x2={chartWidth - 12}
                y2={chartHeight - 28}
                stroke={Colors.border}
              />
              <Line
                x1="12"
                y1="16"
                x2="12"
                y2={chartHeight - 28}
                stroke={Colors.border}
              />
              <Polyline
                points={points}
                fill="none"
                stroke={Colors.primary}
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {entries.map((entry, index) => {
                const x =
                  entries.length === 1
                    ? chartWidth / 2
                    : 18 + (index * (chartWidth - 36)) / (entries.length - 1);
                const y =
                  chartHeight -
                  28 -
                  ((entry.weightKg - min) / span) * (chartHeight - 56);
                return (
                  <Circle
                    key={entry.id}
                    cx={x}
                    cy={y}
                    r="5"
                    fill={Colors.primary}
                  />
                );
              })}
              <SvgText x="18" y="13" fill={Colors.muted} fontSize="10">
                {max.toFixed(1)}
                {/* <Text>kg</Text> */}
              </SvgText>
              <SvgText
                x="18"
                y={chartHeight - 34}
                fill={Colors.muted}
                fontSize="10"
              >
                {min.toFixed(1)}
                <Text>kg</Text>
              </SvgText>
            </Svg>
            <Text
              style={{
                color: change > 0 ? Colors.danger : Colors.green,
              }}
            >
              {formatMessage(fa.trends.change, {
                change: `${toPersianDigits(change.toFixed(1))}${change > 0 ? "+" : ""}`,
              })}
            </Text>
          </>
        ) : (
          <Text style={Styles.subtitle}>{fa.trends.noEntries}</Text>
        )}
      </Card>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.trends.addToday}</Text>
        <DateField
          label={fa.trends.date}
          value={entryDate}
          onChange={setEntryDate}
          maximumDate={new Date()}
        />
        <Field
          label={fa.trends.weight}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder={user?.initialWeightKg.toString()}
        />
        <Button
          title={
            addMutation.isPending
              ? fa.common.saving
              : `${fa.trends.saveWeight}  ${jalaliDateLabel(new Date(`${entryDate}T12:00:00`), "D MMMM")}`
          }
          onPress={() => addMutation.mutate()}
          disabled={addMutation.isPending || !weight}
        />
        {addMutation.error ? (
          <Text style={{ color: Colors.danger }}>
            {addMutation.error.message}
          </Text>
        ) : null}
      </Card>
      <Card>
        <Text style={Styles.sectionTitle}>{fa.trends.history}</Text>
        {entries
          .slice()
          .reverse()
          .map((entry) => (
            <View
              key={entry.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: Colors.ink }}>
                {jalaliDateLabel(
                  new Date(`${entry.entryDate}T12:00:00`),
                  "D MMMM",
                )}
              </Text>
              <Text style={{ color: Colors.ink, fontWeight: "700" }}>
                {toPersianDigits(entry.weightKg.toFixed(1))}{" "}
                {fa.common.kilograms}
              </Text>
            </View>
          ))}
      </Card>
      <Notice tone="neutral">{fa.trends.weightDisclaimer}</Notice>
    </Page>
  );
}
