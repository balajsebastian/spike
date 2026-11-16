import { useEffect, useRef, useState } from "react";
import type { GlucoseReading } from "@/shared/types";
import type { AlarmSoundKind, Settings } from "@/features/settings/types";
import { REPEAT_GRACE_MS } from "../constants";
import { isNoDataActive, isNoDataAlarmDue } from "../helpers/noData";

/**
 * Rings when no new reading has arrived for a while (sensor, app or internet down).
 * Checked after each poll (`polledAt`), so coming back from the background doesn't ring
 * before the fresh reading has had a chance to load. Returns whether data is missing right now.
 */
export function useNoDataAlarm(
  reading: GlucoseReading | null,
  settings: Settings,
  polledAt: number,
  snoozeUntil: number,
  ring: (kind: AlarmSoundKind, at: number) => void,
): boolean {
  // With no reading yet, the countdown starts at launch.
  const [startedAt] = useState(() => Date.now());
  const lastAlarmAtRef = useRef(0);
  const lastDataAt = reading?.timestampMs ?? startedAt;

  useEffect(function checkNoData() {
    if (snoozeUntil > polledAt) return;
    const due = isNoDataAlarmDue(
      settings,
      lastDataAt,
      polledAt,
      lastAlarmAtRef.current,
      settings.nonUrgentRepeatMinutes,
      REPEAT_GRACE_MS,
    );
    if (!due) return;

    lastAlarmAtRef.current = polledAt;
    ring("noData", polledAt);
  }, [settings, lastDataAt, polledAt, snoozeUntil, ring]);

  return isNoDataActive(settings, lastDataAt, polledAt);
}
