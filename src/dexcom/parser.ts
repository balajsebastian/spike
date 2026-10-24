import {
  type RawGlucoseReading,
  type GlucoseReading,
  type TrendDirection,
  TREND_ARROWS,
} from "./types";

export function parseDexcomDate(dateStr: string): number {
  const match = dateStr.match(/Date\((\d+)/);
  if (!match) throw new Error(`Cannot parse Dexcom date: ${dateStr}`);
  return parseInt(match[1], 10);
}

export function parseGlucoseReading(raw: RawGlucoseReading): GlucoseReading {
  const trend = raw.Trend as TrendDirection;
  const sensorTimestampMs = parseDexcomDate(raw.WT);

  return {
    trend,
    valueMgdl: raw.Value,
    trendArrow: TREND_ARROWS[trend] ?? "?",
    sensorTimestamp: new Date(sensorTimestampMs),
    sensorTimestampMs,
  };
}
