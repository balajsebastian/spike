export type AlarmSound = "beep" | "double-beep" | "arcade" | "siren" | "chime" | "signal";

export const ALARM_SOUNDS: { label: string; value: AlarmSound }[] = [
  { label: "Beep", value: "beep" },
  { label: "Double Beep", value: "double-beep" },
  { label: "Arcade", value: "arcade" },
  { label: "Siren", value: "siren" },
  { label: "Chime", value: "chime" },
  { label: "Signal", value: "signal" },
];

/** Each alarm kind has its own sound, so you can tell what is happening without looking. */
export type AlarmSoundKind = "urgentLow" | "low" | "high" | "urgentHigh" | "trend" | "noData";

export const ALARM_SOUND_KINDS: AlarmSoundKind[] = ["urgentLow", "low", "high", "urgentHigh", "trend", "noData"];

export function isAlarmSoundKind(value: unknown): value is AlarmSoundKind {
  return ALARM_SOUND_KINDS.includes(value as AlarmSoundKind);
}

export interface Settings {
  theme: "dark" | "light";
  unit: "mgdl" | "mmol";
  showTrendLine: boolean;
  urgentLowThreshold: number;
  lowThreshold: number;
  highThreshold: number;
  urgentHighThreshold: number;
  urgentLowEnabled: boolean;
  lowEnabled: boolean;
  highEnabled: boolean;
  urgentHighEnabled: boolean;
  fallingEnabled: boolean;
  risingEnabled: boolean;
  nonUrgentRepeatMinutes: number;
  /** Alarms when no new reading has arrived for `noDataMinutes` (sensor, app or internet down). */
  noDataEnabled: boolean;
  noDataMinutes: number;
  snoozeEnabled: boolean;
  snoozeMinutes: number;
  alarmSounds: Record<AlarmSoundKind, AlarmSound>;
  /** Dims the monitor between `nightStartMinutes` and `nightEndMinutes` (minutes after midnight). */
  nightModeEnabled: boolean;
  nightStartMinutes: number;
  nightEndMinutes: number;
  /** How bright the monitor stays at night, in percent. */
  nightBrightness: number;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  unit: "mgdl",
  showTrendLine: false,
  urgentLowThreshold: 55,
  lowThreshold: 70,
  highThreshold: 140,
  urgentHighThreshold: 250,
  urgentLowEnabled: true,
  lowEnabled: true,
  highEnabled: true,
  urgentHighEnabled: true,
  fallingEnabled: true,
  risingEnabled: true,
  nonUrgentRepeatMinutes: 20,
  noDataEnabled: true,
  noDataMinutes: 20,
  snoozeEnabled: true,
  snoozeMinutes: 5,
  // Most urgent gets the most alarming sound.
  alarmSounds: {
    urgentLow: "siren",
    low: "double-beep",
    high: "chime",
    urgentHigh: "signal",
    trend: "beep",
    noData: "arcade",
  },
  nightModeEnabled: false,
  nightStartMinutes: 23 * 60,
  nightEndMinutes: 7 * 60,
  nightBrightness: 30,
};

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  iconBadge: string;
}

export const THEMES: Record<"dark" | "light", ThemeColors> = {
  dark: {
    background: "#000",
    surface: "#1c1c1e",
    text: "#fff",
    textSecondary: "#999",
    textTertiary: "#555",
    border: "#333",
    iconBadge: "#3a3a3c",
  },
  light: {
    background: "#f2f2f7",
    surface: "#fff",
    text: "#000",
    textSecondary: "#666",
    textTertiary: "#999",
    border: "#c6c6c8",
    iconBadge: "#8e8e93",
  },
};

export function mgdlToMmol(mgdl: number): number {
  return Math.round((mgdl / 18.0182) * 10) / 10;
}

export function formatGlucose(mgdl: number, unit: "mgdl" | "mmol"): string {
  if (unit === "mmol") return mgdlToMmol(mgdl).toFixed(1);
  return String(Math.round(mgdl));
}
