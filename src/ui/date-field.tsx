import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  View,
} from "react-native";
import fa from "@/i18n/fa.json";
import {
  jalaliDateLabel,
  jalaliDaysInMonth,
  jalaliParts,
  jalaliToIsoDate,
  toIsoDate,
  toPersianDigits,
} from "@/lib/dates";
import { Button } from "./button";
import { Text } from "./text";
import { Colors, Styles } from "./theme";

const wheelRowHeight = 44;
const wheelVisibleRows = 5;
const wheelHeight = wheelRowHeight * wheelVisibleRows;

export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
}: {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const [visible, setVisible] = useState(false);
  const currentParts = jalaliParts(value);
  const [selected, setSelected] = useState(currentParts);
  const todayParts = jalaliParts(new Date());
  const minimumParts = minimumDate
    ? jalaliParts(minimumDate)
    : { year: todayParts.year - 100, month: 0, day: 1 };
  const maximumParts = maximumDate
    ? jalaliParts(maximumDate)
    : { year: todayParts.year + 10, month: 11, day: 29 };
  const years = useMemo(
    () =>
      Array.from(
        { length: maximumParts.year - minimumParts.year + 1 },
        (_, index) => minimumParts.year + index,
      ),
    [maximumParts.year, minimumParts.year],
  );
  const days = useMemo(
    () =>
      Array.from(
        { length: jalaliDaysInMonth(selected.year, selected.month) },
        (_, index) => index + 1,
      ),
    [selected.month, selected.year],
  );
  const isoDate = jalaliToIsoDate(selected.year, selected.month, selected.day);
  const isBeforeMinimum =
    isoDate !== null &&
    minimumDate !== undefined &&
    isoDate < toIsoDate(minimumDate);
  const isAfterMaximum =
    isoDate !== null &&
    maximumDate !== undefined &&
    isoDate > toIsoDate(maximumDate);

  useEffect(() => {
    if (!days.length || selected.day <= days.length) return;
    setSelected((previous) => ({ ...previous, day: days.length }));
  }, [days, selected.day]);

  const openWheel = () => {
    setSelected(currentParts);
    setVisible(true);
  };

  return (
    <View style={{ gap: 7 }}>
      <Text style={Styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${jalaliDateLabel(new Date(`${value}T12:00:00`))}`}
        accessibilityHint={fa.dateWheel.accessibility}
        onPress={openWheel}
        style={[Styles.input, { justifyContent: "center" }]}
      >
        <Text style={{ color: Colors.ink }}>
          {jalaliDateLabel(new Date(`${value}T12:00:00`))}
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
            <Text style={Styles.sectionTitle}>{fa.dateWheel.title}</Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
              }}
            >
              <WheelColumn
                label={fa.dateWheel.day}
                options={days.map(toPersianDigits)}
                selectedIndex={selected.day - 1}
                onSelect={(index) =>
                  setSelected((previous) => ({ ...previous, day: days[index] }))
                }
                testID="date-wheel-day"
              />
              <WheelColumn
                label={fa.dateWheel.month}
                options={fa.dateWheel.months}
                selectedIndex={selected.month}
                onSelect={(month) =>
                  setSelected((previous) => ({ ...previous, month }))
                }
                testID="date-wheel-month"
              />
              <WheelColumn
                label={fa.dateWheel.year}
                options={years.map(toPersianDigits)}
                selectedIndex={years.indexOf(selected.year)}
                onSelect={(index) =>
                  setSelected((previous) => ({
                    ...previous,
                    year: years[index],
                  }))
                }
                testID="date-wheel-year"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={fa.dateWheel.cancel}
                  secondary
                  onPress={() => setVisible(false)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={fa.dateWheel.confirm}
                  disabled={!isoDate || isBeforeMinimum || isAfterMaximum}
                  onPress={() => {
                    if (isoDate && !isBeforeMinimum && !isAfterMaximum) {
                      onChange(isoDate);
                      setVisible(false);
                    }
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
    if (selectedIndex < 0) return;
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
      {/* <Text style={Styles.label}>{label}</Text> */}
      <View style={{ height: wheelHeight, width: 92, overflow: "hidden" }}>
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
