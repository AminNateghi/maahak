import assert from "node:assert/strict";
import test from "node:test";
import { estimateCycle } from "./cycle";

const regular = {
  averageCycleDays: 28,
  periodDurationDays: 5,
  regularity: "regular" as const,
};

test("estimates cycle day, next period, ovulation, and phases", () => {
  const result = estimateCycle("2024-03-01", "2024-03-15", regular);
  assert.ok(result);
  assert.equal(result.cycleDay, 15);
  assert.equal(result.nextPeriodStart, "2024-03-29");
  assert.equal(result.ovulationDate, "2024-03-15");
  assert.equal(result.pmsStart, "2024-03-24");
  assert.equal(result.periodDates.size, 5);
  assert.equal(result.predictedPeriodDates.size, 5);
  assert.equal(result.ovulationDates.has("2024-03-15"), true);
});

test("keeps a missed period visible instead of rolling the estimate forward", () => {
  const result = estimateCycle("2024-03-01", "2024-03-30", regular);
  assert.ok(result);
  assert.equal(result.cycleDay, 30);
  assert.equal(result.nextPeriodStart, "2024-03-29");
  assert.equal(result.predictedPeriodDates.has("2024-03-29"), true);
});

test("marks unknown or irregular cycles as uncertain", () => {
  const result = estimateCycle("2024-03-01", "2024-03-15", {
    ...regular,
    regularity: "unknown",
  });
  assert.equal(result?.isIrregular, true);
});

test("rejects out-of-range cycle inputs", () => {
  assert.equal(
    estimateCycle("2024-03-01", "2024-03-15", {
      ...regular,
      averageCycleDays: 15,
    }),
    null,
  );
  assert.equal(
    estimateCycle("2024-03-01", "2024-03-15", {
      ...regular,
      periodDurationDays: 11,
    }),
    null,
  );
});
