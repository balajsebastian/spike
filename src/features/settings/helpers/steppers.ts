import type { Settings } from "../types";
import {
  DAY_BRIGHTNESS_MAX,
  DAY_BRIGHTNESS_MIN,
  DAY_BRIGHTNESS_STEP,
  NON_URGENT_REPEAT_MAX,
  NON_URGENT_REPEAT_MIN,
  NON_URGENT_REPEAT_STEP,
  NIGHT_BRIGHTNESS_MAX,
  NIGHT_BRIGHTNESS_MIN,
  NIGHT_BRIGHTNESS_STEP,
  NIGHT_TIME_STEP,
  NO_DATA_MAX,
  NO_DATA_MIN,
  NO_DATA_STEP,
  SNOOZE_MAX,
  SNOOZE_MIN,
  THRESHOLD_MAX,
  THRESHOLD_MIN,
  THRESHOLD_STEP,
} from "../constants";

export type StepDirection = -1 | 1;
export type NightTimeKey = "nightStartMinutes" | "nightEndMinutes";
export type ThresholdKey =
  | "urgentLowThreshold"
  | "lowThreshold"
  | "highThreshold"
  | "urgentHighThreshold"
  | "nightLowThreshold"
  | "nightHighThreshold"
  | "nightUrgentHighThreshold";

/** One step down or up, never past `min` / `max`. */
export function stepWithin(value: number, direction: StepDirection, step: number, min: number, max: number): number {
  return direction < 0 ? Math.max(min, value - step) : Math.min(max, value + step);
}

/**
 * Thresholds keep their order with at least one step between them: urgent low < low < high < urgent high,
 * by day and at night. Urgent Low is shared, so with night thresholds on it stays below both Lows.
 */
function thresholdBounds(settings: Settings, key: ThresholdKey): { min: number; max: number } {
  switch (key) {
    case "urgentLowThreshold":
      return {
        min: THRESHOLD_MIN,
        max:
          (settings.nightThresholdsEnabled ? Math.min(settings.lowThreshold, settings.nightLowThreshold) : settings.lowThreshold) -
          THRESHOLD_STEP,
      };
    case "nightLowThreshold":
      return { min: settings.urgentLowThreshold + THRESHOLD_STEP, max: settings.nightHighThreshold - THRESHOLD_STEP };
    case "nightHighThreshold":
      return { min: settings.nightLowThreshold + THRESHOLD_STEP, max: settings.nightUrgentHighThreshold - THRESHOLD_STEP };
    case "nightUrgentHighThreshold":
      return { min: settings.nightHighThreshold + THRESHOLD_STEP, max: THRESHOLD_MAX };
    case "lowThreshold":
      return { min: settings.urgentLowThreshold + THRESHOLD_STEP, max: settings.highThreshold - THRESHOLD_STEP };
    case "highThreshold":
      return { min: settings.lowThreshold + THRESHOLD_STEP, max: settings.urgentHighThreshold - THRESHOLD_STEP };
    case "urgentHighThreshold":
      return { min: settings.highThreshold + THRESHOLD_STEP, max: THRESHOLD_MAX };
  }
}

/** Pushes the night thresholds up just enough to sit in order above the shared Urgent Low. */
export function orderNightThresholds(settings: Settings): Partial<Settings> {
  const nightLowThreshold = Math.max(settings.nightLowThreshold, settings.urgentLowThreshold + THRESHOLD_STEP);
  const nightHighThreshold = Math.max(settings.nightHighThreshold, nightLowThreshold + THRESHOLD_STEP);
  const nightUrgentHighThreshold = Math.max(settings.nightUrgentHighThreshold, nightHighThreshold + THRESHOLD_STEP);
  return { nightLowThreshold, nightHighThreshold, nightUrgentHighThreshold };
}

export function stepThreshold(settings: Settings, key: ThresholdKey, direction: StepDirection): Partial<Settings> {
  const { min, max } = thresholdBounds(settings, key);
  return { [key]: stepWithin(settings[key], direction, THRESHOLD_STEP, min, max) };
}

export function stepRepeat(settings: Settings, direction: StepDirection): Partial<Settings> {
  return {
    nonUrgentRepeatMinutes: stepWithin(
      settings.nonUrgentRepeatMinutes,
      direction,
      NON_URGENT_REPEAT_STEP,
      NON_URGENT_REPEAT_MIN,
      NON_URGENT_REPEAT_MAX,
    ),
  };
}

export function stepNoDataMinutes(settings: Settings, direction: StepDirection): Partial<Settings> {
  return { noDataMinutes: stepWithin(settings.noDataMinutes, direction, NO_DATA_STEP, NO_DATA_MIN, NO_DATA_MAX) };
}

export function stepSnooze(settings: Settings, direction: StepDirection): Partial<Settings> {
  return { snoozeMinutes: stepWithin(settings.snoozeMinutes, direction, 1, SNOOZE_MIN, SNOOZE_MAX) };
}

const MINUTES_PER_DAY = 24 * 60;

/** Times wrap around midnight: 23:30 + 30 min is 00:00. */
export function stepNightTime(settings: Settings, key: NightTimeKey, direction: StepDirection): Partial<Settings> {
  const next = (settings[key] + direction * NIGHT_TIME_STEP + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return { [key]: next };
}

export function stepDayBrightness(settings: Settings, direction: StepDirection): Partial<Settings> {
  return {
    dayBrightness: stepWithin(settings.dayBrightness, direction, DAY_BRIGHTNESS_STEP, DAY_BRIGHTNESS_MIN, DAY_BRIGHTNESS_MAX),
  };
}

export function stepNightBrightness(settings: Settings, direction: StepDirection): Partial<Settings> {
  return {
    nightBrightness: stepWithin(
      settings.nightBrightness,
      direction,
      NIGHT_BRIGHTNESS_STEP,
      NIGHT_BRIGHTNESS_MIN,
      NIGHT_BRIGHTNESS_MAX,
    ),
  };
}
