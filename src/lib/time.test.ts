import assert from "node:assert/strict";
import test from "node:test";
import { formatTime, parseTime } from "./time";

test("parses valid 24-hour times", () => {
  assert.deepEqual(parseTime("00:00"), { hour: 0, minute: 0 });
  assert.deepEqual(parseTime("23:59"), { hour: 23, minute: 59 });
});

test("rejects times outside the 24-hour clock", () => {
  assert.equal(parseTime("24:00"), null);
  assert.equal(parseTime("12:60"), null);
  assert.equal(parseTime("1:05"), null);
  assert.equal(parseTime("12:05 PM"), null);
});

test("formats time as zero-padded 24-hour HH:mm", () => {
  assert.equal(formatTime({ hour: 0, minute: 5 }), "00:05");
  assert.equal(formatTime({ hour: 23, minute: 59 }), "23:59");
});

test("rejects out-of-range time parts when formatting", () => {
  assert.throws(() => formatTime({ hour: 24, minute: 0 }), RangeError);
  assert.throws(() => formatTime({ hour: 12, minute: 60 }), RangeError);
});
