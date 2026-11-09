import { drizzle } from "drizzle-orm/expo-sqlite";
import * as SQLite from "expo-sqlite";
import * as schema from "./schema";

const sqlite = SQLite.openDatabaseSync("maahak.db");

sqlite.execSync(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
`);

export const db = drizzle(sqlite, { schema });
