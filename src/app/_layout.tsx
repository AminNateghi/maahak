import { QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { UpdateCheckProvider } from "@/context/update-check-context";
import { db } from "@/db/client";
import migrations from "@/db/migrations/migrations";
import fa from "@/i18n/fa.json";
import { refreshMedicationNotifications } from "@/lib/notifications";
import { queryClient } from "@/lib/query";
import { Text, Toast } from "@/ui";
import { Colors } from "@/ui/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const migration = useMigrations(db, migrations);

  const [loaded] = useFonts({
    Vazirmatn: require("@/assets/fonts/Vazirmatn-VariableFont_wght.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!migration.success) {
      return;
    }
    refreshMedicationNotifications().catch((error: unknown) => {
      console.error("Could not refresh medication notifications", error);
      Toast({ text: fa.database.notificationRefreshMessage });
    });
  }, [migration.success]);

  if (migration.error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 24,
          backgroundColor: Colors.blush,
          direction: "ltr",
        }}
      >
        <Text
          style={{ color: Colors.danger, lineHeight: 24, fontWeight: "bold" }}
        >
          Error On Migration:
        </Text>
        <Text
          style={{ direction: "ltr", color: Colors.danger, lineHeight: 24 }}
        >
          {migration.error.message}
        </Text>
      </View>
    );
  }
  if (!migration.success) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.blush,
        }}
      >
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UpdateCheckProvider>
        <StatusBar style="auto" animated />
        <Stack screenOptions={{ headerShown: false }} />
      </UpdateCheckProvider>
    </QueryClientProvider>
  );
}
