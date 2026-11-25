import { Platform, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";
import { useIsFocused } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { useAuth } from "@/features/auth/AuthContext";
import type { Credentials } from "@/features/auth/types";
import { useAlarm } from "@/features/alarm/hooks/useAlarm";
import { useMediaVolume } from "@/features/alarm/hooks/useMediaVolume";
import { LOW_VOLUME } from "@/features/alarm/constants";
import { useStoreReviewPrompt } from "@/features/storeReview/hooks/useStoreReviewPrompt";
import { isUrgentLevel } from "@/features/alarm/helpers/alarmLevel";
import { useGlucose } from "../hooks/useGlucose";
import { useBlink } from "../hooks/useBlink";
import { useNow } from "../hooks/useNow";
import { getStatusText } from "../helpers/status";
import { formatDelta, getDelta } from "../helpers/delta";
import { getReadingDisplay, snoozeMinutesLeft } from "../helpers/display";
import { getMonitorLayout } from "../helpers/layout";
import { getNightBrightness, getScreenBrightness, isAlarmRinging } from "../helpers/nightMode";
import { useScreenBrightness } from "../hooks/useScreenBrightness";
import { MonitorView } from "../components/MonitorView";

const CLOCK_TICK_MS = 10_000;
// Delta and predicted alerts only need the last few readings, so a short history is kept even without the trend line.
const SHORT_HISTORY_MINUTES = 20;

interface Props {
  credentials: Credentials;
}

/** Polls the CGM, runs the alarm, and turns it all into what the monitor screen shows. */
export function MonitorContainer({ credentials }: Props) {
  const { t } = useTranslation();
  const { settings, theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const now = useNow(CLOCK_TICK_MS);
  const trendWindowMinutes = settings.trendWindowHours * 60;
  const needsShortHistory = settings.showDelta || settings.predictedLowEnabled || settings.predictedHighEnabled;
  const historyMinutes = settings.showTrendLine ? trendWindowMinutes : needsShortHistory ? SHORT_HISTORY_MINUTES : null;

  const { reading, error, credentialsRejected, connected, polledAt, history } = useGlucose(
    credentials,
    historyMinutes,
  );
  const { alarmLevel, noDataAlarm, snooze, cancelSnooze, snoozeUntil, lastAlarmAt } = useAlarm(
    reading,
    history,
    settings,
    polledAt,
  );

  const volume = useMediaVolume();
  // Android turns the volume up for alarms by itself; iOS can't, so tell the user.
  const volumeWarning =
    Platform.OS === "ios" && volume !== null && volume < LOW_VOLUME
      ? t("monitor.lowVolume", { percent: Math.round(volume * 100) })
      : null;
  const delta = settings.showDelta ? getDelta(history, reading) : null;
  const display = getReadingDisplay(reading, now, settings, { normal: theme.text, noData: theme.textTertiary });
  const blinkOpacity = useBlink(isUrgentLevel(alarmLevel) && !display.isNoData);
  const minutesLeft = snoozeMinutesLeft(snoozeUntil, now);
  const alarmRinging = isAlarmRinging(lastAlarmAt, snoozeUntil, now);
  const nightBrightness = getNightBrightness(settings, now, alarmRinging);
  const screenBrightness = getScreenBrightness(settings, now, alarmRinging);
  // Only while the monitor is on screen: Settings and the other tabs keep the phone's own brightness.
  const isFocused = useIsFocused();
  const brightnessApplied = useScreenBrightness(isFocused ? screenBrightness : null);
  // If the real brightness can't be changed, dim with a black overlay instead.
  const nightDim = screenBrightness !== null && !brightnessApplied ? 1 - screenBrightness : 0;
  // Rating prompt only on a good moment: a fresh reading in range, nothing ringing, not at night or on the nightstand.
  useStoreReviewPrompt(
    !!reading && !display.isNoData && !alarmLevel && !noDataAlarm && nightBrightness === null && screenWidth <= screenHeight,
  );
  const layout = getMonitorLayout({
    width: screenWidth,
    height: screenHeight,
    insets,
    showTrend: settings.showTrendLine,
    reserveSnooze: settings.snoozeEnabled,
    showClock: settings.showClock,
    unit: settings.unit,
  });

  return (
    <MonitorView
      display={display}
      split={layout.split}
      columnWidth={layout.columnWidth}
      readingFontSize={layout.readingFontSize}
      status={getStatusText(reading, connected)}
      delta={delta === null ? null : formatDelta(delta, settings.unit)}
      blinkOpacity={blinkOpacity}
      nightDim={nightDim}
      trend={layout.trend && { readings: history, windowMinutes: trendWindowMinutes, ...layout.trend }}
      now={now}
      clockTop={settings.showClock ? insets.top : null}
      settings={settings}
      theme={theme}
      snooze={settings.snoozeEnabled ? { minutesLeft, canSnooze: !!alarmLevel || noDataAlarm } : null}
      error={error}
      volumeWarning={volumeWarning}
      credentialsRejected={credentialsRejected}
      onSnooze={() => snooze(settings.snoozeMinutes)}
      onCancelSnooze={cancelSnooze}
      onLoginAgain={logout}
    />
  );
}
