import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const dateFieldSource = readFileSync(
  new URL("./date-field.tsx", import.meta.url),
  "utf8",
);
const profileSource = readFileSync(
  new URL("../app/pages/profile.tsx", import.meta.url),
  "utf8",
);

test("date fields use explicit Persian wheel selection instead of native dialogs", () => {
  assert.doesNotMatch(dateFieldSource, /DateTimePickerAndroid/);
  assert.doesNotMatch(dateFieldSource, /<DateTimePicker\b/);
  assert.match(dateFieldSource, /onPress=\{openWheel\}/);
  assert.match(dateFieldSource, /visible=\{visible\}/);
  assert.match(dateFieldSource, /WheelColumn/);
  assert.match(dateFieldSource, /fa\.dateWheel\.months/);
  assert.doesNotMatch(profileSource, /DateTimePicker/);
});
