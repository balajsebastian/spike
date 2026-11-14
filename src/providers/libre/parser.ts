import { type GlucoseReading, type TrendDirection, TREND_ARROWS } from "@/shared/types";
import type { LibreGraphPoint } from "./types";

const LIBRE_TREND_MAP: Record<number, TrendDirection> = {
  1: "SingleDown",
  2: "FortyFiveDown",
  3: "Flat",
  4: "FortyFiveUp",
  5: "SingleUp",
};

export function mapTrend(arrow: number): TrendDirection {
  return LIBRE_TREND_MAP[arrow] ?? "None";
}

/** LibreLinkUp sends ISO dates or US-style "M/D/YYYY h:mm:ss AM" depending on the endpoint. */
export function parseTimestamp(ts: string): number {
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.getTime();

  const match = ts.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)\s*(AM|PM)?/i);
  if (match) {
    const [, month, day, year, hours, minutes, seconds, ampm] = match;
    let h = parseInt(hours);
    if (ampm?.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm?.toUpperCase() === "AM" && h === 12) h = 0;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      h,
      parseInt(minutes),
      parseInt(seconds),
    ).getTime();
  }

  return Date.now();
}

/** A graph point has no trend arrow. */
export function parseGraphPoint(point: LibreGraphPoint): GlucoseReading {
  return {
    valueMgdl: point.ValueInMgPerDl,
    trend: "None",
    trendArrow: TREND_ARROWS.None,
    timestampMs: parseTimestamp(point.FactoryTimestamp || point.Timestamp),
  };
}

export function parseMeasurement(measurement: LibreGraphPoint & { TrendArrow: number }): GlucoseReading {
  const trend = mapTrend(measurement.TrendArrow);
  return {
    valueMgdl: measurement.ValueInMgPerDl,
    trend,
    trendArrow: TREND_ARROWS[trend],
    timestampMs: parseTimestamp(measurement.FactoryTimestamp || measurement.Timestamp),
  };
}
