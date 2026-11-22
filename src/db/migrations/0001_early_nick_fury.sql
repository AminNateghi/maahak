CREATE TABLE `blood_pressure_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entry_date` text NOT NULL,
	`entry_time` text NOT NULL,
	`systolic` integer NOT NULL,
	`diastolic` integer NOT NULL,
	`context` text DEFAULT 'none' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
