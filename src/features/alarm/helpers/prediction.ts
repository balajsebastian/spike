import type { GlucoseReading } from "@/shared/types";

/** How far ahead the predicted low/high looks. */
export const PREDICTION_MINUTES = 20;
// The slope comes from the last 15 minutes: long enough to smooth out sensor noise, short enough to follow a turn.
const FIT_MINUTES = 15;
const MIN_POINTS = 3;
const MIN_SPAN_MINUTES = 10;

/**
 * Where glucose is headed in PREDICTION_MINUTES (mg/dL), from a straight-line fit of the last 15 minutes,
 * or null when there aren't enough recent readings to tell.
 * `latest` is included even if the history hasn't caught up with it yet.
 */
export function predictGlucose(history: GlucoseReading[], latest: GlucoseReading | null): number | null {
  if (!latest) return null;
  const since = latest.timestampMs - FIT_MINUTES * 60_000;
  const points = [...history.filter((r) => r.timestampMs >= since && r.timestampMs < latest.timestampMs), latest];
  if (points.length < MIN_POINTS) return null;
  if (latest.timestampMs - points[0].timestampMs < MIN_SPAN_MINUTES * 60_000) return null;

  // Least squares, with time in minutes before the latest reading.
  const xs = points.map((r) => (r.timestampMs - latest.timestampMs) / 60_000);
  const ys = points.map((r) => r.valueMgdl);
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < xs.length; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  if (den === 0) return null;
  const slopePerMinute = num / den;

  return latest.valueMgdl + slopePerMinute * PREDICTION_MINUTES;
}
