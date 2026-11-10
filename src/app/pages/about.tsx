import Constants from "expo-constants";
import { router, useNavigation } from "expo-router";
import { ArrowRightIcon, ShareIcon } from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Image, Linking, Pressable, StyleSheet, View } from "react-native";
import fa from "@/i18n/fa.json";
import { toPersianDigits } from "@/lib/dates";
import { Card, Colors, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";

export default function AboutScreen() {
  const navigation = useNavigation();
  const [currentVersion, setCurrentVersion] = useState<string>("");

  useEffect(() => {
    setCurrentVersion(Constants.expoConfig?.version ?? "0.0.0");
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.about.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerRight: () => (
        <IconButton icon={ArrowRightIcon} onPress={() => router.back()} />
      ),
      headerLeft: () => <></>,
    });
  }, [navigation]);

  const handleMyWebSite = () => {
    Linking.openURL("https://nateghi.xyz/");
  };

  const handleSourceCode = () => {
    Linking.openURL("https://github.com/AminNateghi/yadli-react-native");
  };

  return (
    <Page>
      <Card>
        <View style={styles.view}>
          <Image
            width={36}
            height={36}
            source={require("./../../../assets/images/maahak-icon.png")}
            style={styles.icon}
          />
          <Text style={styles.appName}>{fa.appName}</Text>
          <Text>
            {fa.about.version}
            {toPersianDigits(currentVersion)}
          </Text>
        </View>
        <Text>{fa.about.description}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>{fa.about.storyTitle}</Text>
        <Text>{fa.about.content}</Text>
      </Card>

      <Card>
        <View style={styles.developerContent}>
          <Text>{fa.about.developedBy}</Text>
          <Pressable onPress={handleMyWebSite}>
            <Text style={styles.link}>
              {fa.about.developerName}
              <ShareIcon color={Colors.primary} size={14} />
            </Text>
          </Pressable>
        </View>
        <View style={styles.developerContent}>
          <Text>{fa.about.sourceOn}</Text>
          <Pressable onPress={handleSourceCode}>
            <Text style={styles.link}>
              {fa.about.github}
              <ShareIcon color={Colors.primary} size={14} />
            </Text>
          </Pressable>
        </View>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  developerContent: {
    flexDirection: "row",
    gap: 10,
    alignItems: "baseline",
    justifyContent: "center",
  },
  link: {
    color: Colors.primary,
  },
  view: {
    justifyContent: "center",
    alignItems: "center",
  },
  appName: {
    fontSize: 24,
    textAlign: "center",
    fontWeight: "bold",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
  },
  icon: { width: 164, height: 164, borderRadius: 8, marginBottom: 10 },
});
