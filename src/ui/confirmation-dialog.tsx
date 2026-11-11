import { Modal, StyleSheet, View } from "react-native";
import fa from "@/i18n/fa.json";
import { Button } from "./button";
import { Text } from "./text";

type ConfirmationDialogProps = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  confirmText?: string;
  cancelText?: string;
};

export const ConfirmationDialog = ({
  visible,
  onConfirm,
  onCancel,
  message,
  confirmText,
  cancelText,
}: ConfirmationDialogProps) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <Button
              title={cancelText ?? fa.common.no}
              secondary
              onPress={onCancel}
            />
            <Button title={confirmText ?? fa.common.yes} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    paddingTop: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 25,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
});
