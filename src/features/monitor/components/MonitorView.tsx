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
  /** Number and chart side by side (landscape with the trend line). */
  split: boolean;
  columnWidth: number | null;
  readingFontSize: number;
  status: { text: string; color?: string };
  /** Formatted change over the last 5 minutes, shown under the arrow; null hides it. */
  delta: string | null;
  blinkOpacity: Animated.Value;
  /** Opacity of the black night-mode overlay (0 = off). */
  nightDim: number;
  trend: { readings: GlucoseReading[]; windowMinutes: number; width: number; height: number } | null;
  now: number;
  settings: Settings;
  theme: ThemeColors;
  snooze: { minutesLeft: number | null; canSnooze: boolean } | null;
  error: string | null;
  /** "Volume is at 10%…", or null when it's loud enough. */
  volumeWarning: string | null;
  credentialsRejected: "invalid" | "locked" | null;
  onSnooze: () => void;
  onCancelSnooze: () => void;
  onLoginAgain: () => void;
}

export function MonitorView({
  display,
  split,
  columnWidth,
  readingFontSize,
  status,
  delta,
  blinkOpacity,
  nightDim,
  trend,
  now,
  settings,
  theme,
  snooze,
  error,
  volumeWarning,
  credentialsRejected,
  onSnooze,
  onCancelSnooze,
  onLoginAgain,
}: Props) {
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar hidden />

      <View style={split ? styles.splitRow : styles.stacked}>
        <View style={split ? [styles.splitColumn, { width: columnWidth ?? undefined }] : styles.stacked}>
          <GlucoseDisplay
            value={display.value}
            trendArrow={display.trendArrow}
            delta={delta}
            color={display.color}
            fontSize={readingFontSize}
            opacity={blinkOpacity}
            status={status.text}
            statusColor={status.color ?? theme.textTertiary}
          />
        </View>

        {trend && (
          <View style={split ? [styles.splitColumn, { width: columnWidth ?? undefined }] : styles.trendBelow}>
            <TrendLine {...trend} now={now} settings={settings} theme={theme} />
          </View>
        )}
      </View>

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

      {volumeWarning && (
        <Text style={styles.volumeWarning} allowFontScaling={false}>
          {volumeWarning}
        </Text>
      )}

      {credentialsRejected && (
        <CredentialsNotice reason={credentialsRejected} theme={theme} onLoginAgain={onLoginAgain} />
      )}

      {/* Dims everything, light theme included; touches go through to the snooze button underneath. */}
      {nightDim > 0 && <View pointerEvents="none" style={[styles.nightOverlay, { opacity: nightDim }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stacked: {
    alignItems: "center",
  },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  splitColumn: {
    alignItems: "center",
  },
  trendBelow: {
    marginTop: 24,
  },
  nightOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000",
  },
  error: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  volumeWarning: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.warning,
    marginTop: 16,
    paddingHorizontal: 20,
    textAlign: "center",
  },
});
