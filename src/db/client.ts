import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import * as schema from "./schema";

export const sqlite = openDatabaseSync("maahak.db");

sqlite.execSync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    `);

export const db = drizzle(sqlite, { schema });
