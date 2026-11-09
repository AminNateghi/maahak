import { StyleSheet } from "react-native";

export const Colors = {
  ink: "#352733",
  muted: "#8B7B86",
  primary: "#9B5475",
  primaryDark: "#78405C",
  rose: "#F8E8EF",
  blush: "#FFF6F8",
  peach: "#FFF0E8",
  lavender: "#F0EBF7",
  border: "#EFE5EA",
  white: "#FFFFFF",
  green: "#4F806A",
  danger: "#A03F50",
};

export const Styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: Colors.blush,
    direction: "rtl",
  },
  text: {
    fontFamily: "Vazirmatn",
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 16,
  },
  title: {
    color: Colors.ink,
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 14,
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginTop: 5,
    marginBottom: 5,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  sectionTitle: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: "bold",

    fontFamily: "Vazirmatn",
  },
  label: {
    color: Colors.ink,
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: Colors.ink,
    backgroundColor: Colors.white,
    fontFamily: "Vazirmatn",
  },
  button: {
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: Colors.rose,
  },
  secondaryButtonText: {
    color: Colors.primaryDark,
  },
  borderError: {
    borderColor: Colors.danger,
  },
});

export const ScreenStyle = {
  headerShadowVisible: false,
  headerTitleStyle: { fontFamily: "Vazirmatn" },
};
