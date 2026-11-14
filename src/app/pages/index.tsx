import { router, useNavigation } from "expo-router";
import { XIcon } from "lucide-react-native";
import { useLayoutEffect } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import fa from "@/i18n/fa.json";
import { Colors, Styles, Text } from "@/ui";
import MenuItem from "@/ui/menu-item";

export default function MenuScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
      headerLeft: () => <></>,
      headerRight: () => <></>,
    });
  }, [navigation]);

  return (
    <View style={{ direction: "rtl" }}>
      <View style={styles.drawer}>
        <View style={styles.header}>
          <View style={styles.iconRow}>
            <Image
              source={require("./../../../assets/images/maahak-icon-transparency.png")}
              style={styles.icon}
            />
            <View style={{ flexDirection: "column", gap: 0 }}>
              <Text style={styles.appName}>{fa.appName}</Text>
              <Text style={styles.subtitle}>{fa.description}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => router.navigate("/(tabs)")}
            style={styles.closeButton}
            accessibilityRole="button"
          >
            <XIcon size={22} />
          </Pressable>
        </View>

        <View style={Styles.separator} />

        <ScrollView>
          <MenuItem
            title={fa.drawer.profile}
            description={fa.drawer.profilePrompt}
            onPress={() => router.navigate("/pages/profile")}
          />
          <MenuItem
            title={fa.drawer.weight}
            description={fa.drawer.weightPrompt}
            onPress={() => router.navigate("/pages/trends")}
          />
          <MenuItem
            title={fa.drawer.medicine}
            description={fa.drawer.medicinePrompt}
            onPress={() => router.navigate("/pages/medicine")}
          />

          <View style={Styles.separator} />

          <MenuItem
            title={fa.drawer.about}
            description={fa.drawer.aboutPrompt}
            onPress={() => router.navigate("/pages/about")}
          />
          <MenuItem
            title={fa.drawer.update}
            description={fa.drawer.updatePrompt}
            onPress={() => router.navigate("/pages/update-check")}
          />
          <MenuItem
            title={fa.drawer.changes}
            description={fa.drawer.changesPrompt}
            onPress={() => router.navigate("/pages/changelog")}
          />
          <MenuItem
            title={fa.drawer.database}
            description={fa.drawer.databasePrompt}
            onPress={() => router.navigate("/pages/database")}
          />

          <View style={Styles.separator} />
          <MenuItem
            title={fa.drawer.disclaimer}
            description={fa.drawer.disclaimerPrompt}
            onPress={() => router.navigate("/pages/disclaimer")}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Image
            source={require("./../../../assets/images/cat.png")}
            style={styles.imageCat}
          />
          <Text style={styles.footerText}>{fa.madeWithLove}</Text>
        </View>
      </View>
    </View>
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
    paddingBottom: 10,
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
  footer: {
    marginTop: "auto",
    marginBottom: 50,
    paddingTop: 10,
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
