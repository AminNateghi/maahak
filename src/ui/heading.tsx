import { View, type ViewStyle } from "react-native";
import { Text } from "./text";
import { Styles } from "./theme";

export function Heading({
  title,
  subtitle,
  style,
}: {
  title?: string;
  subtitle?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[{ gap: 6 }, style]}>
      {title && <Text style={Styles.title}>{title}</Text>}
      {subtitle && <Text style={Styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
