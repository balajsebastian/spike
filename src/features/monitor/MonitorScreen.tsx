import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { formatGlucose } from "@/features/settings/types";
import { isUrgentLevel, useAlarm } from "@/features/alarm/useAlarm";
import { COLORS } from "@/shared/colors";
import type { Credentials } from "@/features/auth/types";
import { useGlucose } from "./useGlucose";
import { getRangeColor, getStatusText } from "./utils";
import { useBlink } from "./useBlink";
import { NO_DATA_MS } from "./constants";

interface Props {
  credentials: Credentials;
}

export function MonitorScreen({ credentials }: Props) {
  const { settings, theme } = useSettingsContext();
  const { t } = useTranslation();
  const { reading, error } = useGlucose(credentials);
  const { alarmLevel, snooze, cancelSnooze, snoozeUntil } = useAlarm(reading, settings);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, []);

  const status = getStatusText(reading);
  const isNoData = !reading || now - reading.timestampMs > NO_DATA_MS;
  const color = reading ? getRangeColor(reading.valueMgdl, settings, theme.text) : theme.textTertiary;
  const isUrgent = isUrgentLevel(alarmLevel);
  const blinkOpacity = useBlink(isUrgent && !isNoData);
  const displayValue = reading ? formatGlucose(reading.valueMgdl, settings.unit) : "--";
  const isSnoozed = snoozeUntil > now;
  const snoozeRemaining = isSnoozed ? Math.round((snoozeUntil - now) / 60_000) : 0;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />

      <Animated.View style={[styles.readingRow, { opacity: blinkOpacity }]}>
        <Text
          style={[styles.reading, { color }]}
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {isNoData || !reading ? "--" : displayValue}
        </Text>
        {!isNoData && reading && (
          <Text style={[styles.trend, { color }]}>
            {reading.trendArrow}
          </Text>
        )}
      </Animated.View>

      <Text style={[styles.ago, { color: status.color ?? theme.textTertiary }]}>
        {status.text}
      </Text>

      {isSnoozed && settings.snoozeEnabled && (
        <TouchableOpacity style={[styles.snoozeBadge, { backgroundColor: theme.border }]} onPress={cancelSnooze}>
          <Text style={[styles.snoozeText, { color: theme.text }]}>
            {t("monitor.snoozed", { count: snoozeRemaining })}
          </Text>
        </TouchableOpacity>
      )}

      {!isSnoozed && alarmLevel && settings.snoozeEnabled && (
        <TouchableOpacity
          style={styles.snoozeBtn}
          onPress={() => snooze(settings.snoozeMinutes)}
        >
          <Text style={styles.snoozeBtnText}>
            {t("monitor.snooze", { count: settings.snoozeMinutes })}
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
  },
  snoozeBtn: {
    marginTop: 16,
    backgroundColor: COLORS.warning,
    borderRadius: 28,
    paddingHorizontal: 32,
    paddingVertical: 10,
  },
  snoozeBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  snoozeBadge: {
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  snoozeText: {
    fontSize: 16,
    textAlign: "center",
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
