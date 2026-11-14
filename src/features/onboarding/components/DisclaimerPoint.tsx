import { StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";

interface Props {
  icon: LucideIcon;
  title: string;
  body: string;
  /** Warning color, for the one rule that decides whether alarms work at all. */
  important?: boolean;
  theme: ThemeColors;
}

export function DisclaimerPoint({ icon: Icon, title, body, important, theme }: Props) {
  return (
    <View style={styles.point}>
      <View style={[styles.iconBadge, { backgroundColor: important ? COLORS.warning : theme.iconBadge }]}>
        <Icon size={20} color={important ? "#000" : "#fff"} strokeWidth={2.2} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: important ? COLORS.warning : theme.text }]}>{title}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
});
