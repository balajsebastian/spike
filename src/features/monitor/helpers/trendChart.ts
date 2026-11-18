import type { GlucoseReading } from "@/shared/types";
import type { Settings } from "@/features/settings/types";

// One dot per 5 minutes keeps 1-minute sources (e.g. Libre) from turning into a smear;
// longer windows group more minutes per dot so there are never more than about MAX_DOTS.
const MIN_BUCKET_MINUTES = 5;
const MAX_DOTS = 48;

/** Minutes per dot: 5 for 2h, 10 for 6h, 15 for 12h. */
export function bucketMinutes(windowMinutes: number): number {
  const perDot = windowMinutes / MAX_DOTS;
  return Math.max(MIN_BUCKET_MINUTES, Math.ceil(perDot / MIN_BUCKET_MINUTES) * MIN_BUCKET_MINUTES);
}

function bucketReadings(readings: GlucoseReading[], bucketMs: number): GlucoseReading[] {
  const buckets = new Map<number, GlucoseReading>();
  for (const r of readings) {
    // Later readings win, so each bucket keeps its most recent value.
    buckets.set(Math.floor(r.timestampMs / bucketMs), r);
  }
  return [...buckets.values()];
}

/** One dot per bucket, always ending with the latest reading. */
export function trendDots(readings: GlucoseReading[], windowMinutes: number): GlucoseReading[] {
  const dots = bucketReadings(readings, bucketMinutes(windowMinutes) * 60_000);
  const last = readings[readings.length - 1];
  if (last && dots[dots.length - 1] !== last) dots.push(last);
  return dots;
}

/** Where a reading is drawn: the chart spans low to high, and anything outside sits on that line (it keeps its color). */
export function plotValue(mgdl: number, settings: Settings): number {
  return Math.min(Math.max(mgdl, settings.lowThreshold), settings.highThreshold);
}
