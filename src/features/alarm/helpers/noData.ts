import type { Settings } from "@/features/settings/types";
import { isRepeatDue } from "./repeat";

type NoDataSettings = Pick<Settings, "noDataEnabled" | "noDataMinutes">;

/**
 * No new reading for `noDataMinutes` (counted from the last reading, or from launch when there is none yet).
 * `checkedAt` is the last poll, so nothing counts as missing before we've actually asked; 0 means never.
 */
export function isNoDataActive(settings: NoDataSettings, lastDataAt: number, checkedAt: number): boolean {
  return settings.noDataEnabled && checkedAt > 0 && checkedAt - lastDataAt >= settings.noDataMinutes * 60_000;
}

/**
 * Rings once when the data stops, then every `repeatMinutes` while it stays missing.
 * A reading that arrives after the last alarm starts over.
 */
export function isNoDataAlarmDue(
  settings: NoDataSettings,
  lastDataAt: number,
  checkedAt: number,
  lastAlarmAt: number,
  repeatMinutes: number,
  graceMs: number,
): boolean {
  if (!isNoDataActive(settings, lastDataAt, checkedAt)) return false;
  return lastAlarmAt < lastDataAt || isRepeatDue(lastAlarmAt, checkedAt, repeatMinutes, graceMs);
}
