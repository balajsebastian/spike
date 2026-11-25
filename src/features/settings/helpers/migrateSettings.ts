import { DEFAULT_SETTINGS, TREND_WINDOW_HOURS, type AlarmSound, type Settings } from "../types";
import { THRESHOLD_STEP } from "../constants";
import { orderNightThresholds } from "./steppers";

type StoredSettings = Partial<Settings> & {
  /** Before 1.1 there was a single sound for every alarm. */
  alarmSound?: AlarmSound;
};

/** Turns whatever an older version saved into a complete, valid Settings object. */
export function migrateSettings(stored: StoredSettings): Settings {
  const { alarmSound: legacySound, ...rest } = stored;
  const merged: Settings = {
    ...DEFAULT_SETTINGS,
    ...rest,
    alarmSounds: { ...DEFAULT_SETTINGS.alarmSounds, ...rest.alarmSounds },
  };

  // A single sound the user picked (anything but the old default) stays on every alarm,
  // so nothing changes without them knowing.
  if (!rest.alarmSounds && legacySound && legacySound !== "beep") {
    merged.alarmSounds = {
      urgentLow: legacySound,
      low: legacySound,
      high: legacySound,
      urgentHigh: legacySound,
      predicted: legacySound,
      trend: legacySound,
      noData: legacySound,
    };
  }

  if (!TREND_WINDOW_HOURS.includes(merged.trendWindowHours)) merged.trendWindowHours = DEFAULT_SETTINGS.trendWindowHours;

  // Settings saved before Urgent High existed may have a High above its default.
  merged.urgentHighThreshold = Math.max(merged.urgentHighThreshold, merged.highThreshold + THRESHOLD_STEP);

  // Night thresholds are new: keep them in order above the shared Urgent Low, whatever it was set to.
  return { ...merged, ...orderNightThresholds(merged) };
}
