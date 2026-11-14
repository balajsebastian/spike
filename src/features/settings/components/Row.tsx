import type { ReactNode } from "react";
import { Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import type { ThemeColors } from "../types";
import { IconBadge } from "./IconBadge";
import { listStyles } from "./styles";

interface Props {
  label: string;
  icon?: LucideIcon;
  theme: ThemeColors;
  children: ReactNode;
}

/** "Icon  Label        [control]" */
export function Row({ label, icon, theme, children }: Props) {
  return (
    <View style={listStyles.row}>
      <View style={listStyles.rowLeading}>
        {icon && <IconBadge icon={icon} backgroundColor={theme.iconBadge} />}
        <Text style={[listStyles.rowLabel, { color: theme.text }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <View style={listStyles.rowTrailing}>{children}</View>
    </View>
  );
}
