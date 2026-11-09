import type { PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import { Styles } from "./theme";

interface Props extends PropsWithChildren {
  style?: ViewStyle;
}

export function Card({ style, children }: Props) {
  return <View style={[Styles.card, style]}>{children}</View>;
}
