import { Pressable } from "react-native";
import { Text } from "./text";
import { Styles } from "./theme";

export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[
        Styles.button,
        secondary && Styles.secondaryButton,
        disabled && { opacity: 0.55 },
      ]}
    >
      <Text
        style={[Styles.buttonText, secondary && Styles.secondaryButtonText]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
