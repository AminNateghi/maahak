export type TimeParts = {
  hour: number;
  minute: number;
};

export function parseTime(value: string): TimeParts | null {
  const match = /^(2[0-3]|[01]\d):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function formatTime({ hour, minute }: TimeParts): string {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new RangeError("Time must be between 00:00 and 23:59.");
  }
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
