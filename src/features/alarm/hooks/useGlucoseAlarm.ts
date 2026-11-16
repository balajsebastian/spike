import { useEffect, useRef } from "react";
import type { GlucoseReading } from "@/shared/types";
import type { AlarmSoundKind, Settings } from "@/features/settings/types";
import { REPEAT_GRACE_MS, URGENT_REPEAT_MINUTES } from "../constants";
import { type LastAlarm, getAlarmLevel, isAlarmDue, isAlarmEnabled, soundKind } from "../helpers/alarmLevel";

/** Rings on each new reading that is out of range or moving fast, respecting repeats and snooze. */
export function useGlucoseAlarm(
  reading: GlucoseReading | null,
  settings: Settings,
  snoozeUntil: number,
  ring: (kind: AlarmSoundKind, at: number) => void,
) {
  const lastAlarmRef = useRef<LastAlarm>({ level: null, time: 0 });
  const lastReadingTimestampRef = useRef(0);

  useEffect(function checkReading() {
    if (!reading || reading.timestampMs === lastReadingTimestampRef.current) return;
    lastReadingTimestampRef.current = reading.timestampMs;

    const level = getAlarmLevel(reading, settings);
    if (!level || !isAlarmEnabled(level, settings)) return;

    const now = Date.now();
    if (snoozeUntil > now) return;
    const due = isAlarmDue(
      level,
      lastAlarmRef.current,
      now,
      settings.nonUrgentRepeatMinutes,
      URGENT_REPEAT_MINUTES,
      REPEAT_GRACE_MS,
    );
    if (!due) return;

    lastAlarmRef.current = { level, time: now };
    ring(soundKind(level), now);
  }, [reading, settings, snoozeUntil, ring]);
}
