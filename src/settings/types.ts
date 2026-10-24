export type AlarmSound = "beep" | "chime" | "horn" | "alert";

export const ALARM_SOUNDS: { label: string; value: AlarmSound }[] = [
  { label: "Beep", value: "beep" },
  { label: "Chime", value: "chime" },
  { label: "Horn", value: "horn" },
  { label: "Alert", value: "alert" },
];

export interface Settings {
  theme: "dark" | "light";
  unit: "mgdl" | "mmol";
  keepScreenOn: boolean;
  urgentLowThreshold: number;
  lowThreshold: number;
  highThreshold: number;
  urgentLowEnabled: boolean;
  lowEnabled: boolean;
  highEnabled: boolean;
  fallingEnabled: boolean;
  risingEnabled: boolean;
  alarmRepeatMinutes: number;
  snoozeMinutes: number;
  alarmSound: AlarmSound;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  unit: "mgdl",
  keepScreenOn: true,
  urgentLowThreshold: 55,
  lowThreshold: 70,
  highThreshold: 140,
  urgentLowEnabled: true,
  lowEnabled: true,
  highEnabled: true,
  fallingEnabled: true,
  risingEnabled: true,
  alarmRepeatMinutes: 5,
  snoozeMinutes: 5,
  alarmSound: "beep",
};

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
}

export const THEMES: Record<"dark" | "light", ThemeColors> = {
  dark: {
    background: "#000",
    surface: "#1c1c1e",
    text: "#fff",
    textSecondary: "#999",
    textTertiary: "#555",
    border: "#333",
  },
  light: {
    background: "#f2f2f7",
    surface: "#fff",
    text: "#000",
    textSecondary: "#666",
    textTertiary: "#999",
    border: "#c6c6c8",
  },
};

export function mgdlToMmol(mgdl: number): number {
  return Math.round((mgdl / 18.0182) * 10) / 10;
}

export function formatGlucose(mgdl: number, unit: "mgdl" | "mmol"): string {
  if (unit === "mmol") return mgdlToMmol(mgdl).toFixed(1);
  return String(Math.round(mgdl));
}
