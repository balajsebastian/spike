import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { formatGlucose } from "@/features/settings/types";
import { useAlarm } from "@/features/alarm/useAlarm";
import { COLORS } from "@/shared/colors";
import type { Credentials } from "@/features/auth/types";
import { useGlucose } from "./useGlucose";
import { getRangeColor, getStatusText } from "./utils";
import { NO_DATA_MS, BLINK_CYCLE_MS, BLINK_ON_MS } from "./constants";

interface Props {
  credentials: Credentials;
}

export function MonitorScreen({ credentials }: Props) {
  const { settings, theme } = useSettingsContext();
  const { reading, error } = useGlucose(credentials);
  const { alarmLevel, snooze, cancelSnooze, isSnoozed, snoozeUntil } = useAlarm(reading, settings);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, []);

  const status = getStatusText(reading);
  const isNoData = !reading || Date.now() - reading.timestampMs > NO_DATA_MS;
  const color = reading ? getRangeColor(reading.valueMgdl, settings, theme.text) : theme.textTertiary;
  const isUrgent = alarmLevel === "urgent-low";
  const blinkOpacity = isUrgent ? (now % BLINK_CYCLE_MS < BLINK_ON_MS ? 1 : 0.3) : 1;
  const displayValue = reading ? formatGlucose(reading.valueMgdl, settings.unit) : "--";
  const snoozeRemaining = isSnoozed ? Math.round((snoozeUntil - now) / 60_000) : 0;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />

      <View style={styles.readingRow}>
        <Text
          style={[styles.reading, { color, opacity: blinkOpacity }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {isNoData || !reading ? "--" : displayValue}
        </Text>
        {!isNoData && reading && (
          <Text style={[styles.trend, { color, opacity: blinkOpacity }]}>
            {reading.trendArrow}
          </Text>
        )}
      </View>

      <Text style={[styles.ago, { color: status.color ?? theme.textTertiary }]}>
        {status.text}
      </Text>

      {isSnoozed && settings.snoozeEnabled && (
        <TouchableOpacity style={[styles.snoozeBadge, { backgroundColor: theme.border }]} onPress={cancelSnooze}>
          <Text style={[styles.snoozeText, { color: theme.text }]}>
            Snoozed {snoozeRemaining}m — tap to cancel
          </Text>
        </TouchableOpacity>
      )}

      {!isSnoozed && alarmLevel && settings.snoozeEnabled && (
        <TouchableOpacity
          style={styles.snoozeBtn}
          onPress={() => snooze(settings.snoozeMinutes)}
        >
          <Text style={styles.snoozeBtnText}>
            Snooze {settings.snoozeMinutes}m
          </Text>
        </TouchableOpacity>
      )}

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  reading: {
    fontSize: 180,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  trend: {
    fontSize: 80,
    fontWeight: "700",
    marginLeft: 4,
  },
  ago: {
    fontSize: 36,
    marginTop: 10,
  },
  snoozeBtn: {
    marginTop: 32,
    backgroundColor: COLORS.warning,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  snoozeBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  snoozeBadge: {
    marginTop: 32,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  snoozeText: {
    fontSize: 16,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
