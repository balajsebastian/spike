// Glucose range colors
export const COLORS = {
  danger: "#ff1744",
  warning: "#ff9800",
  stale: "#ffc107",
  accent: "#007AFF",
} as const;

// Data freshness thresholds
export const NO_DATA_MS = 15 * 60_000;
export const STALE_MS = 10 * 60_000;
export const DELAYED_MS = 8 * 60_000;

// Range color buffer above high threshold
export const HIGH_BUFFER = 20;

// Urgent low blink timing (ms)
export const BLINK_CYCLE_MS = 2000;
export const BLINK_ON_MS = 1000;

// Alarm pattern
export const ALARM_ROUNDS = 2;
export const HAPTIC_BURSTS = 10;
export const HAPTIC_DELAY_MS = 150;
export const ALARM_PAUSE_MS = 2500;

// Settings limits
export const THRESHOLD_MIN = 40;
export const THRESHOLD_MAX = 400;
export const THRESHOLD_STEP = 5;
export const ALARM_REPEAT_MIN = 1;
export const ALARM_REPEAT_MAX = 30;
export const SNOOZE_MIN = 1;
export const SNOOZE_MAX = 15;
export const SNOOZE_WARNING_ABOVE = 5;
