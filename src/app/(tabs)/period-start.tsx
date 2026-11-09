import { useMutation } from "@tanstack/react-query";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect, useState } from "react";
import { addPeriodStart } from "@/db/repository";
import fa from "@/i18n/fa.json";
import { toIsoDate } from "@/lib/dates";
import { queryClient } from "@/lib/query";
import { Button, Card, DateField, Notice, Page, Toast } from "@/ui";
import { IconButton } from "@/ui/icon-button";

export default function PeriodStartScreen() {
  const navigation = useNavigation();
  const today = toIsoDate();
  const [date, setDate] = useState(today);

  const periodMutation = useMutation({
    mutationFn: () => addPeriodStart(date),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["period-starts"] }),
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
      ]);
      Toast({ text: fa.log.periodSavedMessage });
      router.navigate("/(tabs)");
    },
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.periodStart.title,
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

  return (
    <Page>
      <Notice>{fa.periodStart.disclaimer}</Notice>
      <Card>
        <DateField
          label={fa.periodStart.subtitle}
          value={date}
          onChange={setDate}
          maximumDate={new Date()}
        />
        <Button
          title={fa.common.save}
          secondary
          onPress={() => periodMutation.mutate()}
          disabled={periodMutation.isPending}
        />
      </Card>
    </Page>
  );
}
