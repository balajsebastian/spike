import type { Settings } from "@/features/settings/types";

/** How long the screen stays at full brightness after an alarm goes off. */
const ALARM_BRIGHT_MS = 2 * 60_000;

/**
 * The alarm went off in the last couple of minutes and wasn't snoozed.
 * Just being out of range isn't enough: a high that lasts all night would keep the screen bright.
 */
export function isAlarmRinging(lastAlarmAt: number, snoozeUntil: number, now: number): boolean {
  return now - lastAlarmAt < ALARM_BRIGHT_MS && snoozeUntil <= now;
}

type NightSettings = Pick<Settings, "nightModeEnabled" | "nightStartMinutes" | "nightEndMinutes" | "nightBrightness">;

/** Whether `minutes` (after midnight) falls in [start, end), including ranges that cross midnight (23:00–07:00). */
export function isWithinNight(minutes: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
}

/**
 * How dark the black overlay over the monitor should be: 0 is off, 0.7 lets 30% through.
 * An alarm that just went off gets full brightness, so the number can be read.
 */
export function getNightDim(settings: NightSettings, now: number, alarmActive: boolean): number {
  if (!settings.nightModeEnabled || alarmActive) return 0;
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (!isWithinNight(minutes, settings.nightStartMinutes, settings.nightEndMinutes)) return 0;
  return 1 - settings.nightBrightness / 100;
}
