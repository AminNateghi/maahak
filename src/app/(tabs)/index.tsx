import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useNavigation, useRouter } from "expo-router";
import { MenuIcon } from "lucide-react-native";
import { useLayoutEffect, useMemo } from "react";
import { View } from "react-native";
import { getProfile, listPeriodStarts } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { estimateCycle } from "@/lib/cycle";
import {
  daysBetween,
  jalaliDateLabel,
  toIsoDate,
  toPersianDigits,
} from "@/lib/dates";
import { Button, Card, Heading, Notice, Page, Section, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: jalaliDateLabel(),
      headerTitleAlign: "center",
      headerLeft: () => null,
      headerRight: () => (
        <IconButton icon={MenuIcon} onPress={() => router.navigate("/pages")} />
      ),
    });
  }, [navigation, router]);

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
  const { data: periodStarts = [] } = useQuery({
    queryKey: ["period-starts"],
    queryFn: listPeriodStarts,
  });

  const today = toIsoDate();
  const estimate = useMemo(() => {
    if (!user || !periodStarts.length) return null;
    return estimateCycle(
      dayjs(periodStarts[0].startDate).toISOString(),
      today,
      {
        averageCycleDays: user.averageCycleDays,
        periodDurationDays: user.periodDurationDays,
        regularity:
          user.regularity === "regular" || user.regularity === "irregular"
            ? user.regularity
            : "unknown",
      },
    );
  }, [periodStarts, today, user]);

  if (!user)
    return (
      <Page>
        <Heading title={fa.home.welcome} subtitle={fa.home.onboardingPrompt} />
      </Page>
    );

  const lateBy = estimate ? daysBetween(estimate.nextPeriodStart, today) : 0;
  const status = estimate?.periodDates.has(today)
    ? fa.home.recordedPeriod
    : estimate?.predictedPeriodDates.has(today)
      ? fa.home.predictedPeriod
      : estimate?.ovulationDates.has(today)
        ? fa.home.ovulationWindow
        : estimate?.pmsDates.has(today)
          ? fa.home.pmsDays
          : fa.home.cycleDays;

  return (
    <Page>
      <Heading
        title={`${fa.home.helloPrefix}${user.name}${fa.home.helloSuffix}`}
      />
      <Card>
        <View
          style={{
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Text style={Styles.sectionTitle}>{fa.home.cycleToday}</Text>
          <Text
            style={{
              color: Colors.primary,
              fontSize: 44,
              fontWeight: "800",
            }}
          >
            {estimate ? toPersianDigits(estimate.cycleDay) : "—"}
          </Text>
          <Text style={Styles.sectionTitle}>{status}</Text>
        </View>
        <Text style={[Styles.subtitle, { textAlign: "center" }]}>
          {estimate
            ? fa.home.nextPeriod.replace(
                "{date}",
                jalaliDateLabel(
                  new Date(`${estimate.nextPeriodStart}T12:00:00`),
                ),
              )
            : fa.home.recordCyclePrompt}
        </Text>
        {estimate?.isIrregular ? (
          <Notice tone="warning">{fa.home.irregularNotice}</Notice>
        ) : null}
      </Card>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <MetricCard
          title={fa.home.ovulation}
          value={
            estimate
              ? jalaliDateLabel(new Date(`${estimate.ovulationDate}T12:00:00`))
              : fa.home.recordCyclePrompt
          }
          color={Colors.lavender}
        />
        <MetricCard
          title={fa.home.pmsStatus}
          value={
            estimate?.pmsDates.has(today)
              ? fa.home.estimated
              : fa.home.outsideEstimate
          }
          color={Colors.peach}
        />
      </View>

      {estimate
        ? estimate.cycleDay > 10 && (
            <Section>
              <Card>
                <Text style={Styles.subtitle}>{fa.home.startPeriodPrompt}</Text>
                <Button
                  title={fa.home.startPeriodButton}
                  onPress={() => router.push("/pages/period-start")}
                />
              </Card>
            </Section>
          )
        : null}

      {lateBy > 0 ? (
        <Notice tone="warning">{fa.home.latePregnancyNotice}</Notice>
      ) : (
        <Notice tone="neutral">{fa.home.pregnancyNotice}</Notice>
      )}
    </Page>
  );
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 112,
        padding: 14,
        gap: 8,
        borderRadius: 18,
        backgroundColor: color,
      }}
    >
      <Text style={{ color: Colors.muted, fontSize: 12 }}>{title}</Text>
      <Text style={{ color: Colors.ink, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}
