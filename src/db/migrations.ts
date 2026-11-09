import journal from "../../drizzle/meta/_journal.json";

const migrations = {
  journal,
  migrations: {
    m0000: `
CREATE TABLE \`daily_logs\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`log_date\` text NOT NULL,
  \`mood\` text NOT NULL,
  \`symptoms\` text NOT NULL,
  \`note\` text DEFAULT '' NOT NULL,
  \`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`daily_logs_log_date_unique\` ON \`daily_logs\` (\`log_date\`);
--> statement-breakpoint
CREATE TABLE \`medication_reminders\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`medication_name\` text NOT NULL,
  \`interval_hours\` integer NOT NULL,
  \`first_dose_at\` text NOT NULL,
  \`notification_id\` text NOT NULL,
  \`enabled\` integer DEFAULT true NOT NULL,
  \`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`period_starts\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`start_date\` text NOT NULL,
  \`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`period_starts_start_date_unique\` ON \`period_starts\` (\`start_date\`);
--> statement-breakpoint
CREATE TABLE \`profile\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`name\` text NOT NULL,
  \`age\` integer NOT NULL,
  \`height_cm\` real NOT NULL,
  \`initial_weight_kg\` real NOT NULL,
  \`last_period_start\` text NOT NULL,
  \`average_cycle_days\` integer NOT NULL,
  \`period_duration_days\` integer NOT NULL,
  \`regularity\` text NOT NULL,
  \`premenstrual_experience\` text NOT NULL,
  \`pregnancy_intent\` text NOT NULL,
  \`health_conditions\` text NOT NULL,
  \`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE \`weight_entries\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`entry_date\` text NOT NULL,
  \`weight_kg\` real NOT NULL,
  \`created_at\` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX \`weight_entries_entry_date_unique\` ON \`weight_entries\` (\`entry_date\`);
`,
  },
};

export default migrations;
