import type { RawGlucoseReading } from "./types";
import { type GlucoseReading, type TrendDirection, TREND_ARROWS } from "@/shared/types";

function parseDexcomDate(dateStr: string): number {
  const match = dateStr.match(/Date\((\d+)/);
  if (!match) throw new Error(`Cannot parse Dexcom date: ${dateStr}`);
  return parseInt(match[1], 10);
}

export function parseGlucoseReading(raw: RawGlucoseReading): GlucoseReading {
  const trend = raw.Trend as TrendDirection;
  const timestampMs = parseDexcomDate(raw.WT);

  return {
    trend,
    valueMgdl: raw.Value,
    trendArrow: TREND_ARROWS[trend] ?? "?",
    timestampMs,
  };
}
