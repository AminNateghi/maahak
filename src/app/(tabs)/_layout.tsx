import { Tabs } from "expo-router";
import { CalendarIcon, HomeIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import fa from "@/i18n/fa.json";
import { Text } from "@/ui";
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
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontWeight: focused ? "bold" : "light",
                color: focused ? Colors.primaryDark : Colors.muted,
              }}
            >
              {fa.tabs.home}
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <HomeIcon
              size={size}
              strokeWidth={focused ? 2 : 1}
              color={focused ? Colors.primaryDark : Colors.muted}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontWeight: focused ? "bold" : "light",
                color: focused ? Colors.primaryDark : Colors.muted,
              }}
            >
              {fa.tabs.calendar}
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <CalendarIcon
              size={size}
              strokeWidth={focused ? 2 : 1}
              color={focused ? Colors.primaryDark : Colors.muted}
            />
          ),
        }}
      />
    </Tabs>
  );
}
