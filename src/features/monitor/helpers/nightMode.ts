import type { Settings } from "@/features/settings/types";

type NightSettings = Pick<Settings, "nightModeEnabled" | "nightStartMinutes" | "nightEndMinutes" | "nightBrightness">;

/** Whether `minutes` (after midnight) falls in [start, end), including ranges that cross midnight (23:00–07:00). */
export function isWithinNight(minutes: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
}

/**
 * How dark the black overlay over the monitor should be: 0 is off, 0.7 lets 30% through.
 * An alarm that is going off always gets full brightness, so the number can be read.
 */
export function getNightDim(settings: NightSettings, now: number, alarmActive: boolean): number {
  if (!settings.nightModeEnabled || alarmActive) return 0;
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (!isWithinNight(minutes, settings.nightStartMinutes, settings.nightEndMinutes)) return 0;
  return 1 - settings.nightBrightness / 100;
}
