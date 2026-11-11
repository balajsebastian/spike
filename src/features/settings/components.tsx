import { Children, Fragment, isValidElement, type ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import type { ThemeColors } from "./types";

const ICON_SIZE = 30;
const ROW_PADDING = 16;
const ICON_GAP = 12;

export function Section({
  title,
  footer,
  footerColor,
  theme,
  children,
}: {
  title?: string;
  footer?: string | false;
  footerColor?: string;
  theme: ThemeColors;
  children: ReactNode;
}) {
  // Flatten fragments and drop conditional `false` children so separators only sit between real rows.
  const rows = flattenChildren(children);

  return (
    <View style={componentStyles.section}>
      {title && <Text style={[componentStyles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>}
      <View style={[componentStyles.card, { backgroundColor: theme.surface }]}>
        {rows.map((row, index) => (
          <View key={index}>
            {index > 0 && <View style={[componentStyles.separator, { backgroundColor: theme.border }]} />}
            {row}
          </View>
        ))}
      </View>
      {footer ? (
        <Text style={[componentStyles.sectionFooter, { color: footerColor ?? theme.textSecondary }]}>{footer}</Text>
      ) : null}
    </View>
  );
}

function flattenChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );
}

export function Row({
  label,
  icon: Icon,
  theme,
  children,
  vertical,
}: {
  label: string;
  icon?: LucideIcon;
  theme: ThemeColors;
  children: ReactNode;
  vertical?: boolean;
}) {
  return (
    <View style={[componentStyles.row, vertical && componentStyles.rowVertical]}>
      <View style={componentStyles.rowLeading}>
        {Icon && (
          <View style={[componentStyles.iconBadge, { backgroundColor: theme.iconBadge }]}>
            <Icon size={18} color="#fff" strokeWidth={2.25} />
          </View>
        )}
        <Text style={[componentStyles.rowLabel, { color: theme.text }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <View style={[componentStyles.rowTrailing, vertical && componentStyles.rowTrailingVertical]}>{children}</View>
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
    <View style={[componentStyles.segmented, { backgroundColor: theme.background }]}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[componentStyles.segmentedBtn, selected && { backgroundColor: theme.text }]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[componentStyles.segmentedText, { color: selected ? theme.background : theme.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    <View style={[componentStyles.stepper, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={componentStyles.stepperBtn} onPress={onDecrement} hitSlop={6}>
        <Text style={[componentStyles.stepperBtnText, { color: theme.text }]}>−</Text>
      </TouchableOpacity>
      <Text style={[componentStyles.stepperValue, { color: theme.text }]}>{displayValue}</Text>
      <TouchableOpacity style={componentStyles.stepperBtn} onPress={onIncrement} hitSlop={6}>
        <Text style={[componentStyles.stepperBtnText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export const componentStyles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: ROW_PADDING,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionFooter: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: ROW_PADDING,
    paddingTop: 8,
  },
  card: {
    borderRadius: 22,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_PADDING + ICON_SIZE + ICON_GAP,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ROW_PADDING,
    paddingVertical: 10,
    minHeight: 52,
  },
  rowVertical: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingVertical: 12,
  },
  rowLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: ICON_GAP,
    flexShrink: 1,
  },
  iconBadge: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 8,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 16,
    flexShrink: 1,
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  rowTrailingVertical: {
    marginLeft: ICON_SIZE + ICON_GAP,
    marginTop: 12,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 2,
  },
  segmentedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 2,
  },
  stepperBtn: {
    width: 34,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: "500",
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 78,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
