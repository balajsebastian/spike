import { useWindowDimensions } from "react-native";
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
import { TREND_WINDOW_MINUTES } from "../constants";
import { MonitorView } from "../components/MonitorView";

const CLOCK_TICK_MS = 10_000;
const TREND_MAX_WIDTH = 640;
const TREND_SIDE_MARGIN = 48;

interface Props {
  credentials: Credentials;
}

/** Polls the CGM, runs the alarm, and turns it all into what the monitor screen shows. */
export function MonitorContainer({ credentials }: Props) {
  const { settings, theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const now = useNow(CLOCK_TICK_MS);

  const { reading, error, credentialsRejected, history } = useGlucose(
    credentials,
    settings.showTrendLine ? TREND_WINDOW_MINUTES : null,
  );
  const { alarmLevel, snooze, cancelSnooze, snoozeUntil } = useAlarm(reading, settings);

  const display = getReadingDisplay(reading, now, settings, { normal: theme.text, noData: theme.textTertiary });
  const blinkOpacity = useBlink(isUrgentLevel(alarmLevel) && !display.isNoData);
  const minutesLeft = snoozeMinutesLeft(snoozeUntil, now);
  const isLandscape = screenWidth > screenHeight;

  return (
    <MonitorView
      display={display}
      status={getStatusText(reading)}
      blinkOpacity={blinkOpacity}
      trend={
        settings.showTrendLine
          ? {
              readings: history,
              windowMinutes: TREND_WINDOW_MINUTES,
              width: Math.min(screenWidth - TREND_SIDE_MARGIN, TREND_MAX_WIDTH),
              height: isLandscape ? 90 : 150,
            }
          : null
      }
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
