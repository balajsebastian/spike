import { Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "../types";
import { listStyles } from "./styles";

interface Props<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  theme: ThemeColors;
}

export function Segmented<T extends string>({ options, value, onChange, theme }: Props<T>) {
  return (
    <View style={[listStyles.segmented, { backgroundColor: theme.background }]}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[listStyles.segmentedBtn, selected && { backgroundColor: theme.text }]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[listStyles.segmentedText, { color: selected ? theme.background : theme.textSecondary }]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
