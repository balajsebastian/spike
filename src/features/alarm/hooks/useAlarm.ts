import { useCallback, useState } from "react";
import type { GlucoseReading } from "@/shared/types";
import type { AlarmSoundKind, Settings } from "@/features/settings/types";
import { getAlarmLevel } from "../helpers/alarmLevel";
import { useAlarmPlayer } from "./useAlarmPlayer";
import { useGlucoseAlarm } from "./useGlucoseAlarm";
import { useNoDataAlarm } from "./useNoDataAlarm";

/**
 * All alarms for the monitor: glucose (out of range / moving fast) and no data,
 * sharing one snooze. `polledAt` is when the CGM was last asked for data.
 */
export function useAlarm(reading: GlucoseReading | null, settings: Settings, polledAt: number) {
  const [snoozeUntil, setSnoozeUntil] = useState(0);
  // When an alarm last went off, so the screen can light up while it rings (night mode).
  const [lastAlarmAt, setLastAlarmAt] = useState(0);
  const play = useAlarmPlayer(settings.alarmSounds);

  const ring = useCallback(
    (kind: AlarmSoundKind, at: number) => {
      setLastAlarmAt(at);
      play(kind);
    },
    [play],
  );

  useGlucoseAlarm(reading, settings, snoozeUntil, ring);
  const noDataAlarm = useNoDataAlarm(reading, settings, polledAt, snoozeUntil, ring);

  return {
    alarmLevel: getAlarmLevel(reading, settings),
    noDataAlarm,
    snooze: (minutes: number) => setSnoozeUntil(Date.now() + minutes * 60_000),
    cancelSnooze: () => setSnoozeUntil(0),
    snoozeUntil,
    lastAlarmAt,
  };
}
