import { View } from "react-native";
import { Text } from "./text";
import { Styles } from "./theme";

export function Heading({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      {title && <Text style={Styles.title}>{title}</Text>}
      {subtitle && <Text style={Styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
