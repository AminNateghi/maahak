import { router, useNavigation } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { useEffect, useLayoutEffect, useState } from "react";
import { Linking, View } from "react-native";
import { useUpdateCheck } from "@/context/update-check-context";
import fa from "@/i18n/fa.json";
import { Button, Card, Page, Text } from "@/ui";
import { IconButton } from "@/ui/icon-button";

export default function UpdateCheckScreen() {
  const navigation = useNavigation();
  const { checkNow } = useUpdateCheck();
  const [message, setMessage] = useState<string>("");
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string>("");

  useLayoutEffect(() => {
    navigation.setOptions({
      title: fa.checkUpdate.title,
      headerTitleAlign: "center",
      tabBarStyle: {
        display: "none",
      },
      headerRight: () => (
        <IconButton icon={<ArrowRightIcon />} onPress={() => router.back()} />
      ),
      headerLeft: () => <></>,
    });
  }, [navigation]);

  useEffect(() => {
    setUpdateAvailable(false);
    setMessage(fa.checkUpdate.loading);

    async function check() {
      try {
        const result = await checkNow();
        if (!result?.available) {
          setMessage(fa.checkUpdate.noUpdateAvailable);
          setUpdateAvailable(false);
          return;
        }

        setDownloadUrl(result.downloadUrl);
        setMessage(fa.checkUpdate.updateAvailable);
        setUpdateAvailable(true);
      } catch (error) {
        console.error("Manual update check failed:", error);
        setMessage(fa.checkUpdate.error);
        setUpdateAvailable(false);
      }
    }

    check();
  }, [checkNow]);

  const handleConfirm = async () => {
    await Linking.openURL(downloadUrl);
  };

  return (
    <Page>
      <Card>
        <Text>{fa.about.needInternet}</Text>
      </Card>
      <Card>
        <View>
          <Text>{message}</Text>
          <View>
            <Button
              title={fa.checkUpdate.buttonDownload}
              onPress={handleConfirm}
              secondary={!updateAvailable}
              disabled={!updateAvailable}
            />
          </View>
        </View>
      </Card>
    </Page>
  );
}
