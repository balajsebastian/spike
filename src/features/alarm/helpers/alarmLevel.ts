import type { GlucoseReading } from "@/shared/types";
import type { AlarmSoundKind, Settings } from "@/features/settings/types";
import { isRepeatDue } from "./repeat";

export type AlarmLevel = "urgent-low" | "low" | "urgent-high" | "high" | "falling" | "rising" | null;
export type ActiveAlarmLevel = Exclude<AlarmLevel, null>;

export function getAlarmLevel(reading: GlucoseReading | null, settings: Settings): AlarmLevel {
  if (!reading) return null;
  if (reading.valueMgdl < settings.urgentLowThreshold) return "urgent-low";
  if (reading.valueMgdl < settings.lowThreshold) return "low";
  if (reading.valueMgdl > settings.urgentHighThreshold) return "urgent-high";
  if (reading.valueMgdl > settings.highThreshold) return "high";
  if (reading.trend === "DoubleDown" || reading.trend === "SingleDown") return "falling";
  if (reading.trend === "DoubleUp" || reading.trend === "SingleUp") return "rising";
  return null;
}

export function isUrgentLevel(level: AlarmLevel): boolean {
  return level === "urgent-low" || level === "urgent-high";
}

/** Higher is worse: trend < threshold < urgent. Getting worse alarms right away. */
export function severity(level: AlarmLevel): number {
  if (!level) return 0;
  if (isUrgentLevel(level)) return 3;
  if (level === "low" || level === "high") return 2;
  return 1;
}

export function isAlarmEnabled(level: AlarmLevel, settings: Settings): boolean {
  switch (level) {
    // An urgent reading is also past the regular threshold, so it still alarms if only that one is on.
    case "urgent-low": return settings.urgentLowEnabled || settings.lowEnabled;
    case "low": return settings.lowEnabled;
    case "urgent-high": return settings.urgentHighEnabled || settings.highEnabled;
    case "high": return settings.highEnabled;
    case "falling": return settings.fallingEnabled;
    case "rising": return settings.risingEnabled;
    default: return false;
  }
}

export function soundKind(level: ActiveAlarmLevel): AlarmSoundKind {
  switch (level) {
    case "urgent-low": return "urgentLow";
    case "low": return "low";
    case "urgent-high": return "urgentHigh";
    case "high": return "high";
    case "falling":
    case "rising": return "trend";
  }
}

export interface LastAlarm {
  level: AlarmLevel;
  time: number;
}

/**
 * Getting worse (trend -> threshold -> urgent) alarms immediately; otherwise wait for the repeat
 * interval (urgent alarms repeat faster), with a little grace for readings that arrive slightly early.
 */
export function isAlarmDue(
  level: ActiveAlarmLevel,
  last: LastAlarm,
  now: number,
  nonUrgentRepeatMinutes: number,
  urgentRepeatMinutes: number,
  graceMs: number,
): boolean {
  if (severity(level) > severity(last.level)) return true;
  const repeatMinutes = isUrgentLevel(level) ? urgentRepeatMinutes : nonUrgentRepeatMinutes;
  return isRepeatDue(last.time, now, repeatMinutes, graceMs);
}
