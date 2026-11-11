import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { deleteAllHealthData, listReminders } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { formatMessage } from "@/i18n/format";
import { cancelMedicationNotifications } from "@/lib/notifications";
import { queryClient } from "@/lib/query";
import { Button } from "./button";
import { Card } from "./card";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Notice } from "./notice";
import { Text } from "./text";
import { Colors } from "./theme";

export default function DeleteAllRecords() {
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);

  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["medication-reminders"],
    queryFn: listReminders,
  });

  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      for (const reminder of reminders) {
        await cancelMedicationNotifications(reminder.notificationId);
      }
      await deleteAllHealthData();
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/onboarding");
    },
  });

  return (
    <Card>
      <Notice tone="neutral">{fa.profile.deleteAllDescription}</Notice>
      <Button
        title={
          deleteAllMutation.isPending
            ? fa.profile.deletingAll
            : fa.profile.deleteAll
        }
        secondary
        onPress={() => setDeleteDialog(true)}
        disabled={deleteAllMutation.isPending || remindersLoading}
      />
      {deleteAllMutation.error ? (
        <Text style={{ color: Colors.danger }}>
          {formatMessage(fa.profile.deleteAllFailed, {
            error: deleteAllMutation.error.message,
          })}
        </Text>
      ) : null}

      <ConfirmationDialog
        visible={deleteDialog}
        message={fa.profile.deleteAllQuestion}
        onConfirm={() => deleteAllMutation.mutate()}
        onCancel={() => setDeleteDialog(false)}
      />
    </Card>
  );
}
