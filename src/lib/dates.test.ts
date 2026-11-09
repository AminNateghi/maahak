import assert from "node:assert/strict";
import test from "node:test";
import {
  addDays,
  addJalaliMonthsStart,
  addMonthsStart,
  daysBetween,
  jalaliDateLabel,
  jalaliDayNumber,
  jalaliDaysInMonth,
  jalaliMonthGridDates,
  jalaliParts,
  jalaliStartOfMonth,
  jalaliToIsoDate,
  parseIsoDate,
} from "./dates";

test("adds calendar days across month and year boundaries", () => {
  assert.equal(addDays("2024-12-31", 1), "2025-01-01");
  assert.equal(addDays("2024-03-01", -1), "2024-02-29");
});

test("counts days using ISO calendar dates", () => {
  assert.equal(daysBetween("2024-02-28", "2024-03-01"), 2);
});

test("rejects malformed ISO dates", () => {
  assert.equal(parseIsoDate("2024-02-31"), null);
  assert.equal(parseIsoDate("not-a-date"), null);
});

test("converts Gregorian date to a Persian Jalali label", () => {
  assert.equal(jalaliDayNumber("2024-03-20"), "۱");
  assert.match(jalaliDateLabel("2024-03-20"), /فروردین/);
});

test("moves between month starts without drifting at month ends", () => {
  assert.equal(addMonthsStart("2024-03-31", -1), "2024-02-01");
  assert.equal(addMonthsStart("2024-01-31", 1), "2024-02-01");
});

test("finds the start of the current Jalali month", () => {
  assert.equal(jalaliStartOfMonth("2024-04-03"), "2024-03-20");
});

test("moves between Jalali month starts across year boundaries", () => {
  assert.equal(addJalaliMonthsStart("2024-03-20", -1), "2024-02-20");
  assert.equal(addJalaliMonthsStart("2024-03-20", 1), "2024-04-20");
});

test("builds a Saturday-first Jalali month grid without adjacent month dates", () => {
  const dates = jalaliMonthGridDates("2024-04-03");
  const visibleDates = dates.filter((date) => date !== null);
  const firstDate = visibleDates[0];

  assert.equal(dates.length % 7, 0);
  assert.equal(visibleDates.length, 31);
  assert.equal(dates[4], "2024-03-20");
  assert.equal(visibleDates.at(-1), "2024-04-19");
  assert.ok(firstDate);
  assert.equal(jalaliDayNumber(firstDate), "۱");
  assert.ok(
    visibleDates.every(
      (date) => date !== null && jalaliParts(date).month === 0,
    ),
  );
});

test("converts between ISO and Jalali wheel date parts", () => {
  const parts = jalaliParts("2024-03-20");
  assert.deepEqual(parts, { year: 1403, month: 0, day: 1 });
  assert.equal(jalaliToIsoDate(1403, 0, 1), "2024-03-20");
});

test("clamps wheel day values to the selected Jalali month", () => {
  assert.equal(jalaliDaysInMonth(1403, 0), 31);
  assert.equal(jalaliDaysInMonth(1403, 6), 30);
  assert.equal(jalaliDaysInMonth(1402, 11), 29);
  assert.equal(jalaliToIsoDate(1402, 11, 30), null);
});
