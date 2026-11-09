import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "./text";
import { Styles } from "./theme";

export function Section({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <View style={{ gap: 12 }}>
      {title && <Text style={Styles.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
}
