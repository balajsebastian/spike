import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";

interface Props {
  /** Minutes left while snoozed, otherwise null. */
  snoozedMinutesLeft: number | null;
  /** Whether an alarm is active and can be snoozed. */
  canSnooze: boolean;
  snoozeMinutes: number;
  theme: ThemeColors;
  onSnooze: () => void;
  onCancelSnooze: () => void;
}

/** "Snooze 5m" while alarming, "Snoozed 3m — tap to cancel" while snoozed. */
export function SnoozeControl({ snoozedMinutesLeft, canSnooze, snoozeMinutes, theme, onSnooze, onCancelSnooze }: Props) {
  const { t } = useTranslation();

  if (snoozedMinutesLeft !== null) {
    return (
      <TouchableOpacity style={[styles.badge, { backgroundColor: theme.border }]} onPress={onCancelSnooze}>
        <Text style={[styles.badgeText, { color: theme.text }]}>
          {t("monitor.snoozed", { count: snoozedMinutesLeft })}
        </Text>
      </TouchableOpacity>
    );
  }

  if (!canSnooze) return null;

  return (
    <TouchableOpacity style={styles.button} onPress={onSnooze}>
      <Text style={styles.buttonText}>{t("monitor.snooze", { count: snoozeMinutes })}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  badge: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  badgeText: {
    fontSize: 16,
    textAlign: "center",
  },
});
