import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { Text } from "./text";
import { Colors } from "./theme";

export function Notice({
  children,
  tone = "description",
}: PropsWithChildren<{
  tone?: "neutral" | "warning" | "information" | "danger" | "description";
}>) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 16,

        backgroundColor:
          tone === "danger"
            ? Colors.danger + 30
            : tone === "warning"
              ? Colors.peach
              : tone === "information"
                ? Colors.green + 30
                : Colors.border + 50,
      }}
    >
      <Text
        style={{
          color: tone === "neutral" ? Colors.muted : Colors.ink,
          lineHeight: 23,
          fontSize: tone === "neutral" ? 12 : 14,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
