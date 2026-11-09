import { Tabs } from "expo-router";
import { CalendarIcon, HomeIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fa from "@/i18n/fa.json";
import { Colors } from "@/ui/theme";

const TAB_BAR_CONTENT_HEIGHT = 60;

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        animation: "fade",
        headerStyle: { backgroundColor: Colors.blush },
        headerShadowVisible: false,
        headerTintColor: Colors.ink,
        headerTitleStyle: {
          fontFamily: "Vazirmatn",
          fontSize: 16,
          fontWeight: "bold",
        },
        tabBarShowLabel: true,
        tabBarStyle: {
          direction: "rtl",
          height: TAB_BAR_CONTENT_HEIGHT + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 500,
          fontFamily: "Vazirmatn",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: fa.tabs.home,
          tabBarIcon: ({ color, size }) => (
            <HomeIcon size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: fa.tabs.calendar,
          tabBarIcon: ({ color, size }) => (
            <CalendarIcon size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
