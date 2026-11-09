import { Tabs } from "expo-router";
import { Colors } from "@/ui/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        animation: "fade",
        headerStyle: { backgroundColor: Colors.blush },
        headerShadowVisible: false,
        headerTintColor: Colors.ink,
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 16,
          fontWeight: "bold",
        },
        tabBarStyle: {
          display: "none",
        },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="disclaimer" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="medicine" />
      <Tabs.Screen name="period-start" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="trends" />
    </Tabs>
  );
}
