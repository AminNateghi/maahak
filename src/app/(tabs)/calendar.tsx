import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigation, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BubblesIcon,
  FlameKindlingIcon,
  type LucideIcon,
  MenuIcon,
  SquareTextIcon,
  TargetIcon,
} from "lucide-react-native";
import { useLayoutEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { getProfile, listDailyLogs, listPeriodStarts } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { estimateCycle } from "@/lib/cycle";
import {
  addJalaliMonthsStart,
  jalaliDateLabel,
  jalaliDayNumber,
  jalaliMonthGridDates,
  jalaliMonthLabel,
  jalaliStartOfMonth,
  toIsoDate,
} from "@/lib/dates";
import { Button, Card, Notice, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

const weekDays = fa.calendar.weekDays;

export default function CalendarScreen() {
  const router = useRouter();

  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.calendar.title,
      headerTitleAlign: "center",
      headerLeft: () => null,
      headerRight: () => (
        <IconButton icon={MenuIcon} onPress={() => router.navigate("/pages")} />
      ),
    });
  }, [navigation, router]);

  const [month, setMonth] = useState(jalaliStartOfMonth());
  const [selected, setSelected] = useState(toIsoDate());
  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const { data: periodStarts = [] } = useQuery({
    queryKey: ["period-starts"],
    queryFn: listPeriodStarts,
  });
  const { data: logs = [] } = useQuery({
    queryKey: ["daily-logs"],
    queryFn: listDailyLogs,
  });
  const estimate =
    user && periodStarts.length
      ? estimateCycle(
          dayjs(periodStarts[0].startDate).toISOString(),
          toIsoDate(),
          {
            averageCycleDays: user.averageCycleDays,
            periodDurationDays: user.periodDurationDays,
            regularity:
              user.regularity === "regular" || user.regularity === "irregular"
                ? user.regularity
                : "unknown",
          },
        )
      : null;
  const monthDates = useMemo(() => jalaliMonthGridDates(month), [month]);
  const selectedLog = logs.find((log) => log.logDate === selected);
  const dateIsIn = (dates: Set<string> | undefined) =>
    dates?.has(selected) ?? false;

  return (
    <Page>
      <Card>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => setMonth(addJalaliMonthsStart(month, -1))}
            style={Styles.buttonMonth}
          >
            <ArrowRightIcon />
            <Text style={Styles.label}>{fa.calendar.previousMonth}</Text>
          </Pressable>
          <Text style={{ color: Colors.ink, fontWeight: "700", fontSize: 17 }}>
            {jalaliMonthLabel(new Date(`${month}T12:00:00`))}
          </Text>
          <Pressable
            onPress={() => setMonth(addJalaliMonthsStart(month, 1))}
            style={Styles.buttonMonth}
          >
            <ArrowLeftIcon />
            <Text style={Styles.label}>{fa.calendar.nextMonth}</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: "row" }}>
          {weekDays.map((day) => (
            <Text
              key={day}
              style={{ flex: 1, textAlign: "center", color: Colors.muted }}
            >
              {day}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {monthDates.map((date, index) => {
            if (!date)
              return (
                <View
                  key={`empty-${index.toString()}`}
                  style={{ width: "14.285%", height: 45 }}
                />
              );
            const period =
              estimate?.periodDates.has(date) ||
              estimate?.predictedPeriodDates.has(date);
            const ovulation = estimate?.ovulationDates.has(date);
            const pms = estimate?.pmsDates.has(date);
            const hasLog = logs.some((log) => log.logDate === date);
            const today = date === toIsoDate();
            return (
              <Pressable
                key={date}
                onPress={() => setSelected(date)}
                style={{
                  width: "14.285%",
                  height: 45,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 16,
                  marginBottom: 3,
                  backgroundColor:
                    date === selected
                      ? Colors.primary
                      : period
                        ? Colors.rose
                        : ovulation
                          ? Colors.lavender
                          : pms
                            ? Colors.peach
                            : "transparent",
                  borderWidth: today ? 1 : 0,
                  borderColor: Colors.primary,
                }}
              >
                <Text
                  style={{
                    color: date === selected ? Colors.white : Colors.ink,
                  }}
                >
                  {jalaliDayNumber(new Date(`${date}`))}
                </Text>
                <View style={{ flexDirection: "row", gap: 3 }}>
                  {hasLog && (
                    <SquareTextIcon
                      size={12}
                      color={date === selected ? Colors.white : null}
                    />
                  )}
                  {period && (
                    <TargetIcon
                      size={12}
                      color={date === selected ? Colors.white : Colors.danger}
                    />
                  )}
                  {ovulation && (
                    <BubblesIcon
                      size={12}
                      color={date === selected ? Colors.white : null}
                    />
                  )}
                  {pms && (
                    <FlameKindlingIcon
                      size={12}
                      color={date === selected ? Colors.white : null}
                    />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          <Legend icon={TargetIcon} title={fa.calendar.periodLegend} />
          <Legend icon={BubblesIcon} title={fa.calendar.ovulationLegend} />
          <Legend icon={FlameKindlingIcon} title={fa.calendar.pmsLegend} />
          <Legend icon={SquareTextIcon} title={fa.calendar.noteLegend} />
        </View>
      </Card>
      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{
              color: Colors.ink,
              fontSize: 17,
              fontWeight: "700",
            }}
          >
            {jalaliDateLabel(new Date(`${selected}T12:00:00`))}
          </Text>
        </View>
        <Text style={{ color: Colors.muted }}>
          {dateIsIn(estimate?.periodDates)
            ? fa.calendar.recordedPeriod
            : dateIsIn(estimate?.predictedPeriodDates)
              ? fa.calendar.predictedPeriod
              : dateIsIn(estimate?.ovulationDates)
                ? fa.calendar.predictedOvulation
                : dateIsIn(estimate?.pmsDates)
                  ? fa.calendar.predictedPms
                  : fa.calendar.cycleDay}
        </Text>
        {selectedLog ? (
          <Text style={{ color: Colors.ink }}>
            {fa.calendar.mood}
            {selectedLog.mood || fa.common.notRecorded}
            {selectedLog.note ? `\n${fa.calendar.note}${selectedLog.note}` : ""}
          </Text>
        ) : selected > toIsoDate() ? null : (
          <Text style={{ color: Colors.muted }}>{fa.calendar.noNote}</Text>
        )}
        {selected > toIsoDate() ? (
          <Text style={{ color: Colors.muted }}>
            {fa.calendar.futureDisabled}
          </Text>
        ) : (
          <Button
            title={fa.calendar.recordDay}
            secondary
            disabled={selected > toIsoDate()}
            onPress={() =>
              router.push({
                pathname: "/pages/log",
                params: { date: selected },
              })
            }
          />
        )}
      </Card>
      {estimate?.isIrregular ? (
        <Notice tone="warning">{fa.calendar.irregularNotice}</Notice>
      ) : null}
    </Page>
  );
}

function Legend({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Icon size={12} />
      <Text style={{ color: Colors.muted, fontSize: 12 }}>{title}</Text>
    </View>
  );
}
