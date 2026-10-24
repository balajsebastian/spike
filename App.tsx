import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import type { GlucoseReading } from "./src/types";
import {
  COLORS,
  NO_DATA_MS,
  STALE_MS,
  DELAYED_MS,
  HIGH_BUFFER,
  BLINK_CYCLE_MS,
  BLINK_ON_MS,
} from "./src/constants";
import { useGlucose } from "./src/hooks/useGlucose";
import { useAlarm } from "./src/hooks/useAlarm";
import { useCredentials, type Credentials } from "./src/hooks/useCredentials";
import { useDisclaimer } from "./src/hooks/useDisclaimer";
import { LoginScreen } from "./src/screens/LoginScreen";
import { DisclaimerScreen } from "./src/screens/DisclaimerScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SettingsProvider, useSettingsContext } from "./src/settings/SettingsContext";
import { formatGlucose, type Settings } from "./src/settings/types";

function KeepAwake() {
  useKeepAwake();
  return null;
}

function getRangeColor(mgdl: number, settings: Settings, normalColor: string): string {
  if (mgdl < settings.urgentLowThreshold) return COLORS.danger;
  if (mgdl < settings.lowThreshold) return COLORS.warning;
  if (mgdl <= settings.highThreshold) return normalColor;
  if (mgdl <= settings.highThreshold + HIGH_BUFFER) return COLORS.warning;
  return COLORS.danger;
}

function getStatusText(reading: GlucoseReading | null): { text: string; color?: string } {
  if (!reading) return { text: "CONNECTING..." };

  const ms = Date.now() - reading.timestampMs;
  const min = Math.floor(ms / 60_000);

  if (ms > NO_DATA_MS) return { text: "NO DATA", color: COLORS.danger };
  if (ms > STALE_MS) return { text: `STALE · ${min}m ago`, color: COLORS.stale };
  if (ms > DELAYED_MS) return { text: `DELAYED · ${min}m ago`, color: COLORS.stale };
  return { text: min <= 0 ? "just now" : `${min} min ago` };
}

function MonitorScreen({ credentials, onLogout }: {
  credentials: Credentials;
  onLogout: () => void;
}) {
  const { settings, theme } = useSettingsContext();
  const { reading, error } = useGlucose(credentials);
  const { alarmLevel, snooze, cancelSnooze, isSnoozed, snoozeUntil } = useAlarm(reading, settings);
  const [showSettings, setShowSettings] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(interval);
  }, []);

  if (showSettings) {
    return <SettingsScreen onBack={() => setShowSettings(false)} />;
  }

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

      <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettings(true)}>
        <Text style={[styles.btnText, { color: theme.textTertiary }]}>Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={[styles.btnText, { color: theme.textTertiary }]}>Logout</Text>
      </TouchableOpacity>

      <Text
        style={[styles.reading, { color, opacity: blinkOpacity }]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {isNoData ? "--" : `${displayValue} ${reading!.trendArrow}`}
      </Text>

      <Text style={[styles.ago, { color: status.color ?? theme.textTertiary }]}>
        {status.text}
      </Text>

      {isSnoozed && (
        <TouchableOpacity style={[styles.snoozeBadge, { backgroundColor: theme.border }]} onPress={cancelSnooze}>
          <Text style={[styles.snoozeText, { color: theme.text }]}>
            Snoozed {snoozeRemaining}m — tap to cancel
          </Text>
        </TouchableOpacity>
      )}

      {!isSnoozed && alarmLevel && (
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

function AppContent() {
  const { theme } = useSettingsContext();
  const { credentials, loading, save, clear } = useCredentials();
  const disclaimer = useDisclaimer();

  if (loading || disclaimer.loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar hidden />
        <Text style={{ color: theme.textTertiary, fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!disclaimer.accepted) {
    return <DisclaimerScreen onAccept={disclaimer.accept} />;
  }

  if (!credentials) {
    return <LoginScreen onLogin={save} />;
  }

  return <MonitorScreen credentials={credentials} onLogout={clear} />;
}

function KeepAwakeWrapper() {
  const { settings } = useSettingsContext();
  if (!settings.keepScreenOn) return null;
  return <KeepAwake />;
}

export default function App() {
  return (
    <SettingsProvider>
      <KeepAwakeWrapper />
      <AppContent />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsBtn: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  logoutBtn: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  btnText: {
    fontSize: 14,
  },
  reading: {
    fontSize: 180,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    paddingHorizontal: 20,
    textAlign: "center",
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
