import { addDays, daysBetween, toIsoDate } from "./dates";

export type CycleProfile = {
  averageCycleDays: number;
  periodDurationDays: number;
  regularity: "regular" | "irregular" | "unknown";
};

export type CycleEstimate = {
  cycleDay: number;
  periodStart: string;
  nextPeriodStart: string;
  ovulationDate: string;
  pmsStart: string;
  periodDates: Set<string>;
  predictedPeriodDates: Set<string>;
  pmsDates: Set<string>;
  ovulationDates: Set<string>;
  isIrregular: boolean;
};

export function estimateCycle(
  lastPeriodStart: string,
  today: string,
  profile: CycleProfile,
): CycleEstimate | null {
  const { averageCycleDays, periodDurationDays, regularity } = profile;
  if (
    !Number.isInteger(averageCycleDays) ||
    averageCycleDays < 18 ||
    averageCycleDays > 45 ||
    !Number.isInteger(periodDurationDays) ||
    periodDurationDays < 1 ||
    periodDurationDays > 10
  ) {
    return null;
  }

  const elapsedDays = daysBetween(lastPeriodStart, today);
  if (elapsedDays < 0) return null;
  const currentStart = toIsoDate(lastPeriodStart);
  const nextPeriodStart = addDays(currentStart, averageCycleDays);
  const ovulationDate = addDays(nextPeriodStart, -14);
  const pmsStart = addDays(nextPeriodStart, -5);
  const cycleDay = daysBetween(currentStart, today) + 1;

  return {
    cycleDay,
    periodStart: currentStart,
    nextPeriodStart,
    ovulationDate,
    pmsStart,
    periodDates: dateRange(currentStart, periodDurationDays),
    predictedPeriodDates: dateRange(nextPeriodStart, periodDurationDays),
    pmsDates: dateRange(pmsStart, 5),
    ovulationDates: dateRange(addDays(ovulationDate, -2), 5),
    isIrregular: regularity !== "regular",
  };
}

function dateRange(start: string, length: number): Set<string> {
  return new Set(Array.from({ length }, (_, index) => addDays(start, index)));
}
