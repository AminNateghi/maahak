import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Maahak",
  slug: "maahak",
  scheme: "maahak",
  version: "1.2.1",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/images/maahak-icon.png",
  platforms: ["android"],
  android: {
    versionCode: 121,
    package: "xyz.nateghi.maahak",
    allowBackup: false,
    permissions: ["POST_NOTIFICATIONS", "VIBRATE"],
    blockedPermissions: ["android.permission.SYSTEM_ALERT_WINDOW"],
  },
  experiments: {
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-status-bar",
    "expo-sqlite",
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
    "expo-sharing",
    [
      "expo-file-system",
      {
        supportsOpeningDocumentsInPlace: true,
        enableFileSharing: true,
      },
    ],
    "./plugins/with-android-release-signing",
  ],
};

export default config;
