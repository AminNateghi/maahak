import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect } from "react";
import { Alert, View } from "react-native";
import {
  deleteAllHealthData,
  getProfile,
  listReminders,
} from "@/db/repository";
import fa from "@/i18n/fa.json";
import { formatMessage } from "@/i18n/format";
import { jalaliDateLabel } from "@/lib/dates";
import { cancelMedicationNotifications } from "@/lib/notifications";
import { Button, Card, Heading, Notice, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";
import { Colors, Styles } from "@/ui/theme";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const { data: reminders = [], isLoading: remindersLoading } = useQuery({
    queryKey: ["medication-reminders"],
    queryFn: listReminders,
  });

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.profile.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerLeft: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
      headerRight: () => null,
    });
  }, [navigation]);

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

  const confirmDeleteAll = () => {
    Alert.alert(fa.profile.deleteAllTitle, fa.profile.deleteAllQuestion, [
      { text: fa.common.cancel, style: "cancel" },
      {
        text: fa.profile.deleteAllConfirm,
        style: "destructive",
        onPress: () => deleteAllMutation.mutate(),
      },
    ]);
  };

  return (
    <Page>
      {user ? (
        <Card>
          <Text style={Styles.sectionTitle}>{fa.profile.initialInfo}</Text>
          <ProfileRow label={fa.onboarding.name} value={user.name} />
          <ProfileRow
            label={fa.onboarding.age}
            value={formatMessage(fa.profile.ageYears, { age: user.age })}
          />
          <ProfileRow
            label={fa.onboarding.height}
            value={formatMessage(fa.profile.height, { height: user.heightCm })}
          />
          <ProfileRow
            label={fa.onboarding.currentWeight}
            value={formatMessage(fa.profile.initialWeight, {
              weight: user.initialWeightKg,
            })}
          />
          <ProfileRow
            label={fa.profile.regularity}
            value={
              fa.profile[
                user.regularity === "regular" || user.regularity === "irregular"
                  ? user.regularity
                  : "unknown"
              ]
            }
          />
          <ProfileRow
            label={fa.profile.cycleLength}
            value={`${user.averageCycleDays} ${fa.common.days}`}
          />
          <ProfileRow
            label={fa.profile.periodDuration}
            value={`${user.periodDurationDays} ${fa.common.days}`}
          />
          <ProfileRow
            label={fa.profile.lastPeriod}
            value={jalaliDateLabel(
              new Date(`${user.lastPeriodStart}T12:00:00`),
            )}
          />
        </Card>
      ) : null}

      <Button
        title={
          deleteAllMutation.isPending
            ? fa.profile.deletingAll
            : fa.profile.deleteAll
        }
        secondary
        onPress={confirmDeleteAll}
        disabled={deleteAllMutation.isPending || remindersLoading}
      />
      {deleteAllMutation.error ? (
        <Text style={{ color: Colors.danger }}>
          {formatMessage(fa.profile.deleteAllFailed, {
            error: deleteAllMutation.error.message,
          })}
        </Text>
      ) : null}
    </Page>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={{ color: Colors.muted }}>{label}</Text>
      <Text style={{ color: Colors.ink, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}
