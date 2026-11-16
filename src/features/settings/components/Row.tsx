import type { ReactNode } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { Info, type LucideIcon } from "lucide-react-native";
import type { ThemeColors } from "../types";
import { IconBadge } from "./IconBadge";
import { listStyles } from "./styles";

const INFO_ICON_SIZE = 16;

interface Props {
  label: string;
  icon?: LucideIcon;
  /** What the setting does; adds an ⓘ next to the label that shows it on tap. */
  info?: string;
  theme: ThemeColors;
  children: ReactNode;
}

/** "Icon  Label ⓘ        [control]" */
export function Row({ label, icon, info, theme, children }: Props) {
  const labelText = (
    <Text style={[listStyles.rowLabel, { color: theme.text }]} numberOfLines={2}>
      {label}
    </Text>
  );

  return (
    <View style={listStyles.row}>
      <View style={listStyles.rowLeading}>
        {icon && <IconBadge icon={icon} backgroundColor={theme.iconBadge} />}
        {info ? (
          <Pressable
            style={listStyles.rowInfo}
            onPress={() => Alert.alert(label, info)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityHint={info}
          >
            {labelText}
            <Info size={INFO_ICON_SIZE} color={theme.textTertiary} />
          </Pressable>
        ) : (
          labelText
        )}
      </View>
      <View style={listStyles.rowTrailing}>{children}</View>
    </View>
  );
}
