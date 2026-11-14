import type { GlucoseReading } from "@/shared/types";
import type { Settings } from "@/features/settings/types";

// One dot per 5 minutes keeps 1-minute sources (e.g. Libre) from turning into a smear.
const BUCKET_MS = 5 * 60_000;
const DOMAIN_PADDING = 20;
const MIN_MGDL = 40;
const MAX_MGDL = 400;

function bucketReadings(readings: GlucoseReading[]): GlucoseReading[] {
  const buckets = new Map<number, GlucoseReading>();
  for (const r of readings) {
    // Later readings win, so each bucket keeps its most recent value.
    buckets.set(Math.floor(r.timestampMs / BUCKET_MS), r);
  }
  return [...buckets.values()];
}

/** One dot per bucket, always ending with the latest reading. */
export function trendDots(readings: GlucoseReading[]): GlucoseReading[] {
  const dots = bucketReadings(readings);
  const last = readings[readings.length - 1];
  if (last && dots[dots.length - 1] !== last) dots.push(last);
  return dots;
}

/** Y range: the readings plus the low/high lines, with some padding, within 40–400 mg/dL. */
export function valueDomain(readings: GlucoseReading[], settings: Settings): { minY: number; maxY: number } {
  const values = readings.map((r) => r.valueMgdl);
  return {
    minY: Math.max(MIN_MGDL, Math.min(...values, settings.lowThreshold) - DOMAIN_PADDING),
    maxY: Math.min(MAX_MGDL, Math.max(...values, settings.highThreshold) + DOMAIN_PADDING),
  };
}
