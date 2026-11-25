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
type BrightnessSettings = NightSettings & Pick<Settings, "dayBrightnessEnabled" | "dayBrightness">;

/** Whether `minutes` (after midnight) falls in [start, end), including ranges that cross midnight (23:00–07:00). */
export function isWithinNight(minutes: number, start: number, end: number): boolean {
  if (start === end) return false;
  return start < end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
}

/**
 * The screen brightness for night mode (0–1), or null when the screen should be at its normal brightness:
 * night mode off, outside the night hours, or an alarm that just went off (so the number can be read).
 */
export function getNightBrightness(settings: NightSettings, now: number, alarmActive: boolean): number | null {
  if (!settings.nightModeEnabled || alarmActive) return null;
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (!isWithinNight(minutes, settings.nightStartMinutes, settings.nightEndMinutes)) return null;
  return settings.nightBrightness / 100;
}

/**
 * The monitor's screen brightness (0–1): the night level during night hours, otherwise the day level when it's on.
 * Null means the phone's own brightness, which is also what an alarm that just went off gets.
 */
export function getScreenBrightness(settings: BrightnessSettings, now: number, alarmActive: boolean): number | null {
  if (alarmActive) return null;
  const night = getNightBrightness(settings, now, false);
  if (night !== null) return night;
  return settings.dayBrightnessEnabled ? settings.dayBrightness / 100 : null;
}
