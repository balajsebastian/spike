import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { useAuth } from "@/features/auth/AuthContext";
import type { Credentials } from "@/features/auth/types";
import { useAlarm } from "@/features/alarm/hooks/useAlarm";
import { isUrgentLevel } from "@/features/alarm/helpers/alarmLevel";
import { useGlucose } from "../hooks/useGlucose";
import { useBlink } from "../hooks/useBlink";
import { useNow } from "../hooks/useNow";
import { getStatusText } from "../helpers/status";
import { getReadingDisplay, snoozeMinutesLeft } from "../helpers/display";
import { getMonitorLayout } from "../helpers/layout";
import { getNightDim, isAlarmRinging } from "../helpers/nightMode";
import { TREND_WINDOW_MINUTES } from "../constants";
import { MonitorView } from "../components/MonitorView";

const CLOCK_TICK_MS = 10_000;

interface Props {
  credentials: Credentials;
}

/** Polls the CGM, runs the alarm, and turns it all into what the monitor screen shows. */
export function MonitorContainer({ credentials }: Props) {
  const { settings, theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const now = useNow(CLOCK_TICK_MS);

  const { reading, error, credentialsRejected, connected, history } = useGlucose(
    credentials,
    settings.showTrendLine ? TREND_WINDOW_MINUTES : null,
  );
  const { alarmLevel, snooze, cancelSnooze, snoozeUntil, lastAlarmAt } = useAlarm(reading, settings);

  const display = getReadingDisplay(reading, now, settings, { normal: theme.text, noData: theme.textTertiary });
  const blinkOpacity = useBlink(isUrgentLevel(alarmLevel) && !display.isNoData);
  const minutesLeft = snoozeMinutesLeft(snoozeUntil, now);
  const nightDim = getNightDim(settings, now, isAlarmRinging(lastAlarmAt, snoozeUntil, now));
  const layout = getMonitorLayout({
    width: screenWidth,
    height: screenHeight,
    insets,
    showTrend: settings.showTrendLine,
    reserveSnooze: settings.snoozeEnabled,
    unit: settings.unit,
  });

  return (
    <MonitorView
      display={display}
      split={layout.split}
      columnWidth={layout.columnWidth}
      readingFontSize={layout.readingFontSize}
      status={getStatusText(reading, connected)}
      blinkOpacity={blinkOpacity}
      nightDim={nightDim}
      trend={layout.trend && { readings: history, windowMinutes: TREND_WINDOW_MINUTES, ...layout.trend }}
      now={now}
      settings={settings}
      theme={theme}
      snooze={settings.snoozeEnabled ? { minutesLeft, canSnooze: !!alarmLevel } : null}
      error={error}
      credentialsRejected={credentialsRejected}
      onSnooze={() => snooze(settings.snoozeMinutes)}
      onCancelSnooze={cancelSnooze}
      onLoginAgain={logout}
    />
  );
}
