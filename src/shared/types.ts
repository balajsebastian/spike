export interface GlucoseReading {
  valueMgdl: number;
  trend: TrendDirection;
  trendArrow: string;
  timestampMs: number;
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
