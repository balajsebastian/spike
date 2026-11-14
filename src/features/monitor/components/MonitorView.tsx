import { Animated, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { GlucoseReading } from "@/shared/types";
import { COLORS } from "@/shared/colors";
import type { Settings, ThemeColors } from "@/features/settings/types";
import type { ReadingDisplay } from "../helpers/display";
import { GlucoseDisplay } from "./GlucoseDisplay";
import { TrendLine } from "./TrendLine";
import { SnoozeControl } from "./SnoozeControl";
import { CredentialsNotice } from "./CredentialsNotice";

interface Props {
  display: ReadingDisplay;
  status: { text: string; color?: string };
  blinkOpacity: Animated.Value;
  trend: { readings: GlucoseReading[]; windowMinutes: number; width: number; height: number } | null;
  now: number;
  settings: Settings;
  theme: ThemeColors;
  snooze: { minutesLeft: number | null; canSnooze: boolean } | null;
  error: string | null;
  credentialsRejected: "invalid" | "locked" | null;
  onSnooze: () => void;
  onCancelSnooze: () => void;
  onLoginAgain: () => void;
}

export function MonitorView({
  display,
  status,
  blinkOpacity,
  trend,
  now,
  settings,
  theme,
  snooze,
  error,
  credentialsRejected,
  onSnooze,
  onCancelSnooze,
  onLoginAgain,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />

      <GlucoseDisplay
        value={display.value}
        trendArrow={display.trendArrow}
        color={display.color}
        opacity={blinkOpacity}
        status={status.text}
        statusColor={status.color ?? theme.textTertiary}
      />

      {trend && (
        <View style={styles.trendLine}>
          <TrendLine {...trend} now={now} settings={settings} theme={theme} />
        </View>
      )}

      {snooze && (
        <SnoozeControl
          snoozedMinutesLeft={snooze.minutesLeft}
          canSnooze={snooze.canSnooze}
          snoozeMinutes={settings.snoozeMinutes}
          theme={theme}
          onSnooze={onSnooze}
          onCancelSnooze={onCancelSnooze}
        />
      )}

      {error && !credentialsRejected && <Text style={styles.error}>{error}</Text>}

      {credentialsRejected && (
        <CredentialsNotice reason={credentialsRejected} theme={theme} onLoginAgain={onLoginAgain} />
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
  trendLine: {
    marginTop: 24,
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
