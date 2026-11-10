import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import fa from "@/i18n/fa.json";
import { Card, Colors, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";
import changelogFa from "./../../../CHANGELOG.md";

type ChangelogEntry = {
  key: string;
  text: string;
  type: "version" | "section" | "item" | "paragraph";
};

const parseChangelog = (changelog: string) =>
  changelog.split("\n").flatMap<ChangelogEntry>((line, index) => {
    let text = line.trim();

    if (!text) {
      return [];
    }

    text = text.replace(/<\/?[^>]+>/g, "").trim();

    if (!text) {
      return [];
    }

    const type = text.startsWith("# ")
      ? "version"
      : text.startsWith("- ")
        ? "item"
        : "paragraph";

    return [
      {
        key: `${index}-${text}`,
        text: text
          .replace(/^#+\s*/, "")
          .replace(/^- /, "")
          .replace(/`/g, ""),
        type,
      },
    ];
  });

export default function ChangelogScreen() {
  const entries = parseChangelog(changelogFa);
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.drawer.changes,
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

  return (
    <Page>
      <Card>
        {entries.map((entry) => (
          <Text
            key={entry.key}
            style={[
              styles.entry,

              entry.type === "version" && styles.versionRTL,
              entry.type === "item" && styles.itemRTL,
            ]}
          >
            {entry.type === "item" ? `• ${entry.text}` : entry.text}
          </Text>
        ))}
      </Card>
      <View style={styles.footer} />
    </Page>
  );
}

const styles = StyleSheet.create({
  entry: {
    color: Colors.ink,
    fontSize: 14,
    lineHeight: 14,
    marginBottom: 8,
  },
  versionRTL: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 10,
  },
  itemRTL: {
    paddingStart: 12,
    marginBottom: 4,
    fontSize: 14,
  },
  footer: {
    height: 24,
  },
});
