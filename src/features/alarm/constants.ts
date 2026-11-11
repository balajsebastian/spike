export const ALARM_ROUNDS = 2;
export const HAPTIC_BURSTS = 10;
export const HAPTIC_DELAY_MS = 150;
export const ALARM_PAUSE_MS = 2500;
export const URGENT_REPEAT_MINUTES = 5;
// Readings arrive on a fixed cadence with some jitter, so a repeat that is due "almost now" still fires on this reading.
export const REPEAT_GRACE_MS = 30_000;
