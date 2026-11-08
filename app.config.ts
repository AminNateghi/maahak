import type { ExpoConfig } from "expo/config";
import fa from "./src/i18n/fa.json";

const config: ExpoConfig = {
  name: fa.appName,
  slug: "maahak",
  scheme: "maahak",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  platforms: ["android"],
  plugins: [
    "expo-router",
    "expo-font",
    ["expo-sqlite", { enableFTS: false }],
    ["expo-notifications", { color: "#9B5475" }],
    "expo-splash-screen"
  ],
  android: {
    package: "xyz.nateghi.maahak",
    allowBackup: false,
    adaptiveIcon: {
      backgroundColor: "#FFF6F8",
    },
    permissions: ["POST_NOTIFICATIONS", "VIBRATE"],
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
