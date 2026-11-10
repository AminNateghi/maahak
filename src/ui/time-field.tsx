import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import fa from "@/i18n/fa.json";
import { toPersianDigits } from "@/lib/dates";
import { formatTime, parseTime } from "@/lib/time";
import { Button } from "./button";
import { Text } from "./text";
import { Colors, Styles } from "./theme";

const wheelRowHeight = 44;
const wheelVisibleRows = 5;
const wheelHeight = wheelRowHeight * wheelVisibleRows;
const hours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);
const minutes = Array.from({ length: 60 }, (_, minute) =>
  String(minute).padStart(2, "0"),
);

export function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (time: string) => void;
}) {
  const currentTime = parseTime(value);
  if (!currentTime) {
    throw new RangeError("TimeField value must be in 24-hour HH:mm format.");
  }

  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(currentTime);

  const openWheel = () => {
    setSelected(currentTime);
    setVisible(true);
  };

  return (
    <View style={{ gap: 7 }}>
      <Text style={Styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${toPersianDigits(formatTime(currentTime))}`}
        accessibilityHint={fa.timeWheel.accessibility}
        onPress={openWheel}
        style={[Styles.input, { justifyContent: "center" }]}
      >
        <Text style={{ color: Colors.ink }}>
          {toPersianDigits(formatTime(currentTime))}
        </Text>
      </Pressable>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 22,
            backgroundColor: "#00000066",
          }}
        >
          <View
            style={{
              padding: 18,
              borderRadius: 22,
              backgroundColor: Colors.white,
              gap: 14,
            }}
          >
            <Text style={Styles.sectionTitle}>{fa.timeWheel.title}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <WheelColumn
                label={fa.timeWheel.minute}
                options={minutes.map(toPersianDigits)}
                selectedIndex={selected.minute}
                onSelect={(minute) =>
                  setSelected((previous) => ({ ...previous, minute }))
                }
                testID="time-wheel-minute"
              />
              <WheelColumn
                label={fa.timeWheel.hour}
                options={hours.map(toPersianDigits)}
                selectedIndex={selected.hour}
                onSelect={(hour) =>
                  setSelected((previous) => ({ ...previous, hour }))
                }
                testID="time-wheel-hour"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={fa.common.cancel}
                  secondary
                  onPress={() => setVisible(false)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={fa.common.confirm}
                  onPress={() => {
                    onChange(formatTime(selected));
                    setVisible(false);
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function WheelColumn({
  label,
  options,
  selectedIndex,
  onSelect,
  testID,
}: {
  label: string;
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  testID: string;
}) {
  const listRef = useRef<FlatList<string>>(null);

  useEffect(() => {
    listRef.current?.scrollToOffset({
      offset: selectedIndex * wheelRowHeight,
      animated: false,
    });
  }, [selectedIndex]);

  const selectAtOffset = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(
      event.nativeEvent.contentOffset.y / wheelRowHeight,
    );
    onSelect(Math.max(0, Math.min(options.length - 1, rawIndex)));
  };

  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <Text style={Styles.label}>{label}</Text>
      <View style={{ height: wheelHeight, width: 112, overflow: "hidden" }}>
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: wheelRowHeight * 2,
            left: 0,
            right: 0,
            height: wheelRowHeight,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: Colors.border,
            backgroundColor: Colors.rose + 40,
            zIndex: 1,
          }}
        />
        <FlatList
          ref={listRef}
          testID={testID}
          accessibilityLabel={label}
          data={options}
          keyExtractor={(item, index) => `${item}-${index}`}
          snapToInterval={wheelRowHeight}
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: wheelRowHeight,
            offset: wheelRowHeight * index,
            index,
          })}
          contentContainerStyle={{ paddingVertical: wheelRowHeight * 2 }}
          onMomentumScrollEnd={selectAtOffset}
          renderItem={({ item, index }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: index === selectedIndex }}
              onPress={() => {
                onSelect(index);
                listRef.current?.scrollToOffset({
                  offset: index * wheelRowHeight,
                  animated: true,
                });
              }}
              style={{ height: wheelRowHeight, justifyContent: "center" }}
            >
              <Text
                style={{
                  color:
                    index === selectedIndex ? Colors.primaryDark : Colors.muted,
                  fontSize: index === selectedIndex ? 17 : 15,
                  fontWeight: index === selectedIndex ? "700" : "400",
                  textAlign: "center",
                }}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}
