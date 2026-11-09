import { Pressable, View } from "react-native";
import { Text } from "./text";
import { Colors, Styles } from "./theme";

export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  getLabel,
}: {
  label: string;
  options: readonly T[];
  value: T | T[];
  onChange: (value: T | T[]) => void;
  multiple?: boolean;
  getLabel?: (value: T) => string;
}) {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <View style={{ gap: 9 }}>
      <Text style={Styles.label}>{label}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!multiple) {
                  onChange(option);
                  return;
                }
                const next = active
                  ? selected.filter((item) => item !== option)
                  : [...selected, option];
                onChange(next);
              }}
              style={{
                borderRadius: 18,
                minWidth: 45,
                paddingHorizontal: 13,
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: active ? Colors.primary : Colors.border,
                backgroundColor: active ? Colors.rose : Colors.white,
              }}
            >
              <Text
                style={{
                  color: active ? Colors.primaryDark : Colors.ink,
                  textAlign: "center",
                }}
              >
                {getLabel ? getLabel(option) : option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
