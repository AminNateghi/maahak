import type { PropsWithChildren } from "react";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Styles } from "./theme";

export function Page({ children }: PropsWithChildren) {
  return (
    <KeyboardAwareScrollView
      style={Styles.page}
      contentContainerStyle={Styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
