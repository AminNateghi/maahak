import { ChevronLeftIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./text";
import { Colors } from "./theme";

export default function MenuItem({
  icon,
  title,
  description,
  onPress,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}

      <View style={styles.menuText}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemDescription}>{description}</Text>
      </View>

      <ChevronLeftIcon size={20} color={Colors.border} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 12,
    borderRadius: 12,
  },
  pressed: {
    backgroundColor: Colors.border + 20,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.border + 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    paddingRight: 10,
  },
  itemDescription: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 0,
    paddingRight: 10,
  },
});
