import { File, Paths } from "expo-file-system";
import { router, useNavigation } from "expo-router";
import * as Sharing from "expo-sharing";
import {
  backupDatabaseAsync,
  openDatabaseAsync,
  type SQLiteDatabase,
} from "expo-sqlite";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { db, sqlite } from "@/db/client";
import { medicationReminders } from "@/db/schema";
import fa from "@/i18n/fa.json";
import {
  removeAllReminderNotifications,
  syncReminderNotifications,
} from "@/lib/notifications";
import { queryClient } from "@/lib/query";
import { Button, Card, Page, Text, Toast } from "@/ui";
import { ConfirmationDialog } from "@/ui/confirmation-dialog";
import { IconButton } from "@/ui/icon-button";

const requiredColumns = {
  profile: ["id", "height_cm", "initial_weight_kg", "last_period_start"],
  period_starts: ["id", "start_date"],
  daily_logs: ["id", "log_date", "mood", "symptoms", "note"],
  weight_entries: ["id", "entry_date", "weight_kg"],
  medication_reminders: [
    "id",
    "medication_name",
    "interval_hours",
    "first_dose_at",
  ],
} as const;

async function isValidBackup(database: SQLiteDatabase) {
  const integrity = await database.getFirstAsync<{
    integrity_check: string;
  }>("PRAGMA integrity_check");
  if (integrity?.integrity_check !== "ok") {
    return false;
  }

  const tables = await database.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table'",
  );
  const tableNames = new Set(tables.map(({ name }) => name));
  if (!tableNames.has("__drizzle_migrations")) {
    return false;
  }

  for (const [table, columns] of Object.entries(requiredColumns)) {
    if (!tableNames.has(table)) {
      return false;
    }

    const tableColumns = await database.getAllAsync<{ name: string }>(
      `PRAGMA table_info("${table}")`,
    );
    const columnNames = new Set(tableColumns.map(({ name }) => name));
    if (!columns.every((column) => columnNames.has(column))) {
      return false;
    }
  }

  return true;
}

export default function DatabaseScreen() {
  const navigation = useNavigation();
  const [action, setAction] = useState<"export" | "restore" | "pick" | null>(
    null,
  );
  const [restoreConfirmationVisible, setRestoreConfirmationVisible] =
    useState(false);
  const pendingBackup = useRef<SQLiteDatabase | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.database.title,
      headerLargeTitle: true,
      headerTitleAlign: "center",
      headerRight: () => (
        <IconButton
          icon={<ArrowRightIcon />}
          onPress={() => router.navigate("/(tabs)")}
        />
      ),
      headerLeft: () => <></>,
    });
  }, [navigation]);

  const handleExport = async () => {
    if (Platform.OS === "web") {
      Toast({ text: fa.database.unsupported });
      return;
    }

    setAction("export");
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("File sharing is not available");
      }

      const backup = await sqlite.serializeAsync();
      const file = new File(
        Paths.cache,
        `maahak-backup-${new Date().toISOString().replace(/[:.]/g, "-")}.db`,
      );
      file.create({ overwrite: true });
      await file.write(backup);
      await Sharing.shareAsync(file.uri, {
        dialogTitle: fa.database.exportTitle,
        mimeType: "application/vnd.sqlite3",
      });
      Toast({ text: fa.database.exportSuccess, type: "success" });
    } catch (error) {
      console.error("Database export failed", error);
      Toast({ text: fa.database.exportFailed, type: "error" });
    } finally {
      setAction(null);
    }
  };

  const handlePickBackup = async () => {
    if (Platform.OS === "web") {
      Toast({ text: fa.database.unsupported, type: "error" });
      return;
    }

    setAction("pick");
    let candidate: SQLiteDatabase | null = null;
    try {
      const result = await File.pickFileAsync({
        mimeTypes: [
          "application/vnd.sqlite3",
          "application/x-sqlite3",
          "application/octet-stream",
        ],
      });
      if (result.canceled) {
        return;
      }

      const file = result.result;
      const bytes = await file.bytes();

      const dbName = `candidate-${Date.now()}.db`;
      const tempFile = new File(Paths.cache, dbName);
      tempFile.create({ overwrite: true });
      await tempFile.write(bytes);

      candidate = await openDatabaseAsync(dbName, undefined, Paths.cache.uri);

      if (!(await isValidBackup(candidate))) {
        Toast({ text: fa.database.invalidBackup, type: "error" });
        return;
      }

      pendingBackup.current = candidate;
      candidate = null;
      setRestoreConfirmationVisible(true);
    } catch (error) {
      console.error("Database backup selection failed", error);
      Toast({ text: fa.database.restoreFailed, type: "error" });
    } finally {
      try {
        await candidate?.closeAsync();
      } catch (error) {
        console.error("[DB-RESTORE] temporary database close failed", error);
      }
      setAction(null);
    }
  };

  const handleRestore = async () => {
    const sourceDatabase = pendingBackup.current;
    setRestoreConfirmationVisible(false);
    if (!sourceDatabase) {
      return;
    }

    setAction("restore");
    try {
      await backupDatabaseAsync({
        sourceDatabase,
        destDatabase: sqlite,
      });
      let notificationSyncFailed = false;
      try {
        await removeAllReminderNotifications();
        const reminder = await db
          .select({ id: medicationReminders.id })
          .from(medicationReminders);
        const results = await Promise.allSettled(
          reminder.map(({ id }) => syncReminderNotifications(id)),
        );
        notificationSyncFailed = results.some(
          (result) => result.status === "rejected",
        );
      } catch (error) {
        console.error("Reminder notification sync after restore failed", error);
        notificationSyncFailed = true;
      }
      await queryClient.invalidateQueries();
      Toast({
        text: notificationSyncFailed
          ? fa.database.restoreNotificationWarning
          : fa.database.restoreSuccess,
        type: notificationSyncFailed ? "warning" : "success",
      });
    } catch (error) {
      console.error("Database restore failed", error);
      Toast({ text: fa.database.restoreFailed, type: "error" });
    } finally {
      pendingBackup.current = null;
      await sourceDatabase.closeAsync();
      setAction(null);
      router.navigate("/(tabs)");
    }
  };

  const cancelRestore = () => {
    setRestoreConfirmationVisible(false);
    pendingBackup.current?.closeSync();
    pendingBackup.current = null;
  };

  return (
    <Page>
      <Card style={styles.card}>
        <Text style={styles.description}>{fa.database.exportDescription}</Text>
        <Button
          title={fa.database.export}
          onPress={() => void handleExport()}
          disabled={action !== null}
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.description}>{fa.database.restoreDescription}</Text>
        <Button
          title={fa.database.restore}
          onPress={() => void handlePickBackup()}
          disabled={action !== null}
        />
      </Card>

      <ConfirmationDialog
        visible={restoreConfirmationVisible}
        onConfirm={() => void handleRestore()}
        onCancel={cancelRestore}
        message={fa.database.restoreConfirmation}
        confirmText={fa.database.restore}
      />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  description: {
    marginBottom: 12,
  },
});
