export interface DexcomConfig {
  username: string;
  password: string;
  region: "eu" | "us";
}

export interface RawGlucoseReading {
  WT: string;
  ST: string;
  DT: string;
  Value: number;
  Trend: string;
}

export interface GlucoseReading {
  valueMgdl: number;
  trend: TrendDirection;
  trendArrow: string;
  sensorTimestamp: Date;
  sensorTimestampMs: number;
}

export type TrendDirection =
  | "DoubleUp"
  | "SingleUp"
  | "FortyFiveUp"
  | "Flat"
  | "FortyFiveDown"
  | "SingleDown"
  | "DoubleDown"
  | "None"
  | "NotComputable";

export const TREND_ARROWS: Record<TrendDirection, string> = {
  DoubleUp: "↑↑",
  SingleUp: "↑",
  FortyFiveUp: "↗",
  Flat: "→",
  FortyFiveDown: "↘",
  SingleDown: "↓",
  DoubleDown: "↓↓",
  None: "?",
  NotComputable: "-",
};

export const BASE_URLS: Record<string, string> = {
  eu: "https://shareous1.dexcom.com/ShareWebServices/Services",
  us: "https://share2.dexcom.com/ShareWebServices/Services",
};

export const APPLICATION_ID = "d89443d2-327c-4a6f-89e5-496bbb0317db";
