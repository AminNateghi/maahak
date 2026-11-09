import type { PropsWithChildren } from "react";
import { ScrollView } from "react-native";
import { Styles } from "./theme";

export function Page({ children }: PropsWithChildren) {
  return (
    <ScrollView
      style={Styles.page}
      contentContainerStyle={Styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
