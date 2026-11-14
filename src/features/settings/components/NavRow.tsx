import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import type { ThemeColors } from "../types";
import { IconBadge } from "./IconBadge";
import { listStyles } from "./styles";

interface Props {
  label: string;
  value: string;
  icon?: LucideIcon;
  theme: ThemeColors;
  onPress: () => void;
}

/** A tappable row showing the current value, iOS-style: "Label    Value ›". */
export function NavRow({ label, value, icon, theme, onPress }: Props) {
  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress} style={listStyles.row}>
      <View style={listStyles.rowLeading}>
        {icon && <IconBadge icon={icon} backgroundColor={theme.iconBadge} />}
        <Text style={[listStyles.rowLabel, { color: theme.text }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <View style={[listStyles.rowTrailing, listStyles.navTrailing]}>
        <Text style={[listStyles.rowLabel, { color: theme.textSecondary }]} numberOfLines={1}>
          {value}
        </Text>
        <ChevronRight size={18} color={theme.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}
