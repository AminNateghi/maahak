import { useQuery } from "@tanstack/react-query";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { getProfile } from "@/db/repository";
import { Colors } from "@/ui/theme";

export default function IndexRoute() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors.blush,
        }}
      >
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }
  if (error) throw error;
  return <Redirect href={user ? "/(tabs)" : "/onboarding"} />;
}
