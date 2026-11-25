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

/** Night mode is on and `now` falls in its hours. */
export function isNightTime(
  settings: Pick<Settings, "nightModeEnabled" | "nightStartMinutes" | "nightEndMinutes">,
  now: number,
): boolean {
  if (!settings.nightModeEnabled) return false;
  const date = new Date(now);
  const minutes = date.getHours() * 60 + date.getMinutes();
  return isWithinNight(minutes, settings.nightStartMinutes, settings.nightEndMinutes);
}

/**
 * The settings the monitor runs on right now: at night, with night thresholds on, Low / High / Urgent High
 * are swapped for the night ones, so the alarm, the colors and the trend line all follow them.
 * Urgent Low stays the same.
 */
export function withNightThresholds(settings: Settings, isNight: boolean): Settings {
  if (!isNight || !settings.nightThresholdsEnabled) return settings;
  return {
    ...settings,
    lowThreshold: settings.nightLowThreshold,
    highThreshold: settings.nightHighThreshold,
    urgentHighThreshold: settings.nightUrgentHighThreshold,
  };
}

/** At 100% Spike leaves the brightness alone, so auto-brightness keeps working. */
function toLevel(percent: number): number | null {
  return percent >= 100 ? null : percent / 100;
}

/**
 * The monitor's screen brightness (0–1): the night level during night hours, otherwise the day level when it's on.
 * Null means the phone's own brightness, which is also what an alarm that just went off gets.
 */
export function getScreenBrightness(settings: BrightnessSettings, now: number, alarmActive: boolean): number | null {
  if (alarmActive) return null;
  if (isNightTime(settings, now)) return toLevel(settings.nightBrightness);
  return settings.dayBrightnessEnabled ? toLevel(settings.dayBrightness) : null;
}
