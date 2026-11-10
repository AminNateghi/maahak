import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Maahak",
  slug: "maahak",
  scheme: "maahak",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "light",
  icon: "./assets/images/maahak-icon.png",
  platforms: ["android"],
  plugins: [
    "expo-router",
    "expo-font",
    ["expo-sqlite", { enableFTS: false }],
    ["expo-notifications", { color: "#9B5475" }],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#FFF6F8",
        image: "./assets/images/maahak-icon-transparency.png",
        dark: {
          backgroundColor: "#352733",
          image: "./assets/images/maahak-icon-transparency.png",
        },
      },
    ],
  ],
  android: {
    versionCode: 100,
    package: "xyz.nateghi.maahak",
    allowBackup: false,
    permissions: ["POST_NOTIFICATIONS", "VIBRATE"],
    blockedPermissions: ["android.permission.SYSTEM_ALERT_WINDOW"],
  },
  experiments: {
    typedRoutes: true,
  },
};

export default config;
