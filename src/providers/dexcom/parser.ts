import type { RawGlucoseReading } from "./types";
import { type GlucoseReading, type TrendDirection, TREND_ARROWS } from "@/shared/types";

const VALID_TRENDS = new Set<string>(Object.keys(TREND_ARROWS));

function parseDexcomDate(dateStr: string): number {
  const match = dateStr.match(/Date\((\d+)/);
  if (!match) throw new Error(`Cannot parse Dexcom date: ${dateStr}`);
  return parseInt(match[1], 10);
}

function parseTrend(raw: string): TrendDirection {
  if (VALID_TRENDS.has(raw)) return raw as TrendDirection;
  return "NotComputable";
}

export function parseGlucoseReading(raw: RawGlucoseReading): GlucoseReading {
  const trend = parseTrend(raw.Trend);
  const timestampMs = parseDexcomDate(raw.WT);

  return {
    trend,
    valueMgdl: raw.Value,
    trendArrow: TREND_ARROWS[trend],
    timestampMs,
  };
}
