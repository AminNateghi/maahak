import assert from "node:assert/strict";
import test from "node:test";
import { type CycleEstimate, estimateCycle } from "./cycle";
import {
  buildCycleReminders,
  getCycleMessageKey,
  getCycleMessages,
} from "./cycle-reminders";

const regular = {
  averageCycleDays: 28,
  periodDurationDays: 5,
  regularity: "regular" as const,
};

function regularEstimate(): CycleEstimate {
  const result = estimateCycle("2024-03-01", "2024-03-15", regular);
  assert.ok(result);
  return result;
}

test("schedules period and PMS reminders at 7:30 the day before and on the day", () => {
  const reminders = buildCycleReminders(
    regularEstimate(),
    regular.averageCycleDays,
    new Date("2024-03-20T00:00:00"),
    1,
  );

  assert.equal(reminders.length, 4);
  for (const reminder of reminders) {
    assert.equal(reminder.at.getHours(), 7);
    assert.equal(reminder.at.getMinutes(), 30);
  }

  const keys = reminders.map(
    ({ phase, timing, date }) => `${phase}:${timing}:${date}`,
  );
  assert.ok(keys.includes("period:tomorrow:2024-03-29"));
  assert.ok(keys.includes("period:today:2024-03-29"));
  assert.ok(keys.includes("pms:tomorrow:2024-03-24"));
  assert.ok(keys.includes("pms:today:2024-03-24"));
});

test("skips reminders whose 7:30 time has already passed", () => {
  const reminders = buildCycleReminders(
    regularEstimate(),
    regular.averageCycleDays,
    new Date("2024-03-24T08:00:00"),
    1,
  );

  assert.deepEqual(
    reminders
      .map(({ phase, timing, date }) => `${phase}:${timing}:${date}`)
      .sort(),
    ["period:today:2024-03-29", "period:tomorrow:2024-03-29"],
  );
});

test("schedules reminders for the following predicted cycles too", () => {
  const reminders = buildCycleReminders(
    regularEstimate(),
    regular.averageCycleDays,
    new Date("2024-03-20T00:00:00"),
    2,
  );

  assert.equal(reminders.length, 8);
  assert.ok(
    reminders.some(
      ({ phase, timing, date }) =>
        phase === "period" && timing === "today" && date === "2024-04-26",
    ),
  );
});

test("picks the relevant message for the current cycle day", () => {
  const estimate = regularEstimate();

  assert.deepEqual(getCycleMessageKey(estimate, "2024-03-28"), {
    phase: "period",
    timing: "tomorrow",
  });
  assert.deepEqual(getCycleMessageKey(estimate, "2024-03-29"), {
    phase: "period",
    timing: "today",
  });
  assert.deepEqual(getCycleMessageKey(estimate, "2024-03-23"), {
    phase: "pms",
    timing: "tomorrow",
  });
  assert.deepEqual(getCycleMessageKey(estimate, "2024-03-24"), {
    phase: "pms",
    timing: "today",
  });
  assert.equal(getCycleMessageKey(estimate, "2024-03-02"), null);
  assert.equal(getCycleMessageKey(estimate, "2024-03-25"), null);
  assert.equal(getCycleMessageKey(estimate, "2024-03-20"), null);
});

test("provides 10 to 15 messages for every phase and timing", () => {
  for (const phase of ["period", "pms"] as const) {
    for (const timing of ["tomorrow", "today"] as const) {
      const count = getCycleMessages(phase, timing).length;
      assert.ok(count >= 10 && count <= 15);
    }
  }
});
