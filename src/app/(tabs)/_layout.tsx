import { Tabs } from "expo-router";
import { Colors } from "@/ui/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.blush },
        headerShadowVisible: false,
        headerTintColor: Colors.ink,
        headerTitleStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 16,
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="period-start" />
      <Tabs.Screen name="trends" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="medicine" />
      <Tabs.Screen name="disclaimer" />
    </Tabs>
  );
}
