import { useCallback, useState } from "react";
import type { GlucoseReading } from "@/shared/types";
import type { AlarmSoundKind, Settings } from "@/features/settings/types";
import { type AlarmLevel, getAlarmLevel } from "../helpers/alarmLevel";
import { predictGlucose } from "../helpers/prediction";
import { useAlarmPlayer } from "./useAlarmPlayer";
import { useGlucoseAlarm } from "./useGlucoseAlarm";
import { useNoDataAlarm } from "./useNoDataAlarm";

interface Snooze {
  until: number;
  /** What was ringing when snooze was pressed. */
  level: AlarmLevel;
}

const NO_SNOOZE: Snooze = { until: 0, level: null };

/**
 * All alarms for the monitor: glucose (out of range / predicted / moving fast) and no data,
 * sharing one snooze. `history` holds the recent readings the prediction is made from;
 * `polledAt` is when the CGM was last asked for data.
 */
export function useAlarm(
  reading: GlucoseReading | null,
  history: GlucoseReading[],
  settings: Settings,
  polledAt: number,
) {
  const [snooze, setSnooze] = useState<Snooze>(NO_SNOOZE);
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

  const predicted = predictGlucose(history, reading);
  const alarmLevel = getAlarmLevel(reading, settings, predicted);

  // Snoozing a high or a no-data alarm must not hide a drop to urgent low: that ends the snooze.
  // Snoozing urgent low itself still works, so you can treat it in peace.
  const breaksSnooze = snooze.until > 0 && alarmLevel === "urgent-low" && snooze.level !== "urgent-low";
  if (breaksSnooze) setSnooze(NO_SNOOZE);
  const snoozeUntil = breaksSnooze ? 0 : snooze.until;

  useGlucoseAlarm(reading, predicted, settings, snoozeUntil, ring);
  const noDataAlarm = useNoDataAlarm(reading, settings, polledAt, snoozeUntil, ring);

  return {
    alarmLevel,
    noDataAlarm,
    snooze: (minutes: number) => setSnooze({ until: Date.now() + minutes * 60_000, level: alarmLevel }),
    cancelSnooze: () => setSnooze(NO_SNOOZE),
    snoozeUntil,
    lastAlarmAt,
  };
}
