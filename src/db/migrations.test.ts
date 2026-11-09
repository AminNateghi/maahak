import assert from "node:assert/strict";
import test from "node:test";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "./migrations";

test("the Expo migrator can resolve every migration in the bundled journal", async () => {
  let migrationQueries: Array<{ sql: string[] }> = [];
  const fakeDatabase = {
    dialect: {
      migrate: async (migrations: Array<{ sql: string[] }>) => {
        migrationQueries = migrations;
      },
    },
    session: {},
  };

  await assert.doesNotReject(() => migrate(fakeDatabase as never, migrations));
  assert.equal(migrationQueries.length, migrations.journal.entries.length);
  assert.match(migrationQueries[0]?.sql[0] ?? "", /CREATE TABLE `daily_logs`/);
});
