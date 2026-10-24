import type { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "./types";

export function SectionHeader({ title, theme }: { title: string; theme: ThemeColors }) {
  return <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>;
}

export function Row({ label, theme, children }: { label: string; theme: ThemeColors; children: ReactNode }) {
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  theme: ThemeColors;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: theme.background }]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segmentedBtn,
            value === opt.value && { backgroundColor: theme.text },
          ]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            style={[
              styles.segmentedText,
              { color: value === opt.value ? theme.background : theme.textSecondary },
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Stepper({
  displayValue,
  onDecrement,
  onIncrement,
  theme,
}: {
  displayValue: string;
  onDecrement: () => void;
  onIncrement: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
        onPress={onDecrement}
      >
        <Text style={[styles.stepperBtnText, { color: theme.text }]}>-</Text>
      </TouchableOpacity>
      <Text style={[styles.stepperValue, { color: theme.text }]}>{displayValue}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
        onPress={onIncrement}
      >
        <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export const componentStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 16,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    padding: 2,
  },
  segmentedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: "500",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "500",
    minWidth: 85,
    textAlign: "center",
  },
});
