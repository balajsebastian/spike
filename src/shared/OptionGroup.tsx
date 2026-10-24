import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle, type TextStyle } from "react-native";

interface OptionGroupProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  theme: { border: string; text: string; textTertiary: string; surface: string };
  disabled?: boolean;
  expand?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  theme,
  disabled,
  expand = true,
  containerStyle,
  buttonStyle,
  labelStyle,
}: OptionGroupProps<T>) {
  return (
    <View style={[styles.container, containerStyle]}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.button,
              expand && styles.expand,
              { borderColor: theme.border },
              selected && { borderColor: theme.text, backgroundColor: theme.surface },
              buttonStyle,
            ]}
            onPress={() => onChange(opt.value)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.label,
                { color: theme.textTertiary },
                selected && { color: theme.text },
                labelStyle,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  expand: {
    flex: 1,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
});
