import { router } from "expo-router";
import { XIcon } from "lucide-react-native";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import fa from "@/i18n/fa.json";
import MenuItem from "./menu-item";
import { Text } from "./text";
import { Colors, Styles } from "./theme";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AppDrawer({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View>
        <View style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.iconRow}>
              <Image
                source={require("./../../assets/images/maahak-icon.png")}
                style={styles.icon}
              />
              <View style={{ flexDirection: "column", gap: 0 }}>
                <Text style={styles.appName}>{fa.appName}</Text>
                <Text style={styles.subtitle}>{fa.description}</Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
            >
              <XIcon size={22} />
            </Pressable>
          </View>

          <View style={Styles.separator} />

          <ScrollView
            style={styles.drawerContent}
            showsVerticalScrollIndicator={false}
          >
            <MenuItem
              //   icon={<CarIcon size={21} color={Theme.primary} />}
              title={fa.drawer.profile}
              description={fa.drawer.profilePrompt}
              onPress={() => router.navigate("/(tabs)/profile")}
            />
            <View style={Styles.separator} />

            <MenuItem
              title={fa.drawer.about}
              description={fa.drawer.aboutPrompt}
              onPress={() => {}}
            />
            <MenuItem
              title={fa.drawer.update}
              description={fa.drawer.updatePrompt}
              onPress={() => {}}
            />
            <MenuItem
              title={fa.drawer.changes}
              description={fa.drawer.changesPrompt}
              onPress={() => {}}
            />
            <View style={Styles.separator} />
            <MenuItem
              title={fa.drawer.disclaimer}
              description={fa.drawer.disclaimerPrompt}
              onPress={() => router.navigate("/(tabs)/disclaimer")}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Image
              source={require("./../../assets/images/cat.png")}
              style={styles.imageCat}
            />
            <Text style={styles.footerText}>{fa.madeWithLove}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  drawer: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.blush,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 22,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.muted,
  },
  closeButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.border + 20,
  },
  drawerContent: {
    flex: 1,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border + 20,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
  },
  icon: { width: 50, height: 50, borderRadius: 12 },
  imageCat: { width: 80, height: 63 },
  iconRow: {
    flexDirection: "row",
    gap: 10,
    alignContent: "center",
    alignItems: "center",
  },
});
