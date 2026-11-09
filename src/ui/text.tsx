import { Text as RNText, type TextProps } from "react-native";
import { Styles } from "./theme";

export function Text({ style, ...props }: TextProps) {
  return <RNText style={[Styles.text, style]} {...props} />;
}
