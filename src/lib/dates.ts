import dayjs, { type ConfigType } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import jalaliDay from "jalaliday";
import "dayjs/locale/fa";
import fa from "@/i18n/fa.json";

dayjs.extend(jalaliDay);
dayjs.extend(customParseFormat);

export function toIsoDate(value: ConfigType = new Date()): string {
  return dayjs(value).format("YYYY-MM-DD");
}

export function parseIsoDate(value: string) {
  const parsed = dayjs(value, "YYYY-MM-DD", true);
  return parsed.isValid() ? parsed : null;
}

export function jalaliDateLabel(
  value: ConfigType = new Date(),
  format?: string,
): string {
  return toPersianDigits(
    dayjs(value)
      .calendar("jalali")
      .locale("fa")
      .format(format ?? "dddd D MMMM"),
  );
}

export function jalaliMonthLabel(value: ConfigType = new Date()): string {
  return toPersianDigits(
    dayjs(value).calendar("jalali").locale("fa").format("MMMM YYYY"),
  );
}

export function jalaliDayNumber(value: ConfigType): string {
  return toPersianDigits(
    dayjs(value).calendar("jalali").locale("fa").format("D"),
  );
}

export function jalaliParts(value: ConfigType): {
  year: number;
  month: number;
  day: number;
} {
  const date = dayjs(value).calendar("jalali");
  return { year: date.year(), month: date.month(), day: date.date() };
}

export function jalaliToIsoDate(
  year: number,
  month: number,
  day: number,
): string | null {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > jalaliDaysInMonth(year, month)
  ) {
    return null;
  }
  const date = dayjs(
    `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    {
      jalali: true,
    },
  );
  return date.isValid() ? date.format("YYYY-MM-DD") : null;
}

export function jalaliDaysInMonth(year: number, month: number): number {
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 0 ||
    month > 11
  ) {
    return 0;
  }
  return dayjs(`${year}-${String(month + 1).padStart(2, "0")}-01`, {
    jalali: true,
  }).daysInMonth();
}

export function jalaliStartOfMonth(value: ConfigType = new Date()): string {
  const { year, month } = jalaliParts(value);
  const date = jalaliToIsoDate(year, month, 1);
  if (date === null) throw new RangeError("Invalid date");
  return date;
}

export function addJalaliMonthsStart(
  value: ConfigType,
  months: number,
): string {
  if (!Number.isInteger(months)) {
    throw new RangeError("months must be an integer");
  }
  const parts = jalaliParts(value);
  const monthIndex = parts.year * 12 + parts.month + months;
  const year = Math.floor(monthIndex / 12);
  const month = monthIndex - year * 12;
  const date = jalaliToIsoDate(year, month, 1);
  if (date === null) throw new RangeError("Invalid date");
  return date;
}

export function jalaliMonthGridDates(value: ConfigType): (string | null)[] {
  const monthStart = jalaliStartOfMonth(value);
  const { year, month } = jalaliParts(monthStart);
  const count = jalaliDaysInMonth(year, month);
  const firstWeekday =
    (weekdayIndex(new Date(`${monthStart}T12:00:00`)) + 1) % 7;
  const dates: (string | null)[] = Array.from(
    { length: firstWeekday },
    () => null,
  );
  for (let day = 0; day < count; day++) dates.push(addDays(monthStart, day));
  while (dates.length < 35 || dates.length % 7 !== 0) dates.push(null);
  return dates;
}

export function toPersianDigits(value: string | number): string {
  return String(value).replace(/\d/g, (digit) => fa.digits[Number(digit)]);
}

export function localTimeLabel(value: ConfigType): string {
  return dayjs(value).format("HH:mm");
}

export function addDays(value: string, days: number): string {
  return dayjs(value).add(days, "day").format("YYYY-MM-DD");
}

export function daysBetween(start: string, end: string): number {
  return dayjs(end).startOf("day").diff(dayjs(start).startOf("day"), "day");
}

export function startOfMonth(value: ConfigType = new Date()): string {
  return dayjs(value).startOf("month").format("YYYY-MM-DD");
}

export function addMonthsStart(value: ConfigType, months: number): string {
  return dayjs(value)
    .startOf("month")
    .add(months, "month")
    .format("YYYY-MM-DD");
}

export function daysInMonth(value: ConfigType = new Date()): number {
  return dayjs(value).daysInMonth();
}

export function weekdayIndex(value: ConfigType): number {
  return dayjs(value).day();
}
