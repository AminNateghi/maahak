import { TextInput, type TextInputProps, View } from "react-native";
import { Text } from "./text";
import { Colors, Styles } from "./theme";

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={Styles.label}>{label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={Colors.muted}
        style={[
          Styles.input,
          props.multiline && { minHeight: 100, paddingTop: 12 },
          error && Styles.borderError,
        ]}
      />
      {error ? <Text style={{ color: Colors.danger }}>{error}</Text> : null}
    </View>
  );
}
