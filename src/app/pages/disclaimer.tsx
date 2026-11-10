import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect } from "react";
import fa from "@/i18n/fa.json";
import { Card, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";

export default function DisclaimerScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.disclaimer.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerRight: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
      headerLeft: () => <></>,
    });
  }, [navigation]);

  return (
    <Page>
      <Card>
        <Text>{fa.disclaimer.content}</Text>
      </Card>
    </Page>
  );
}
