import type { GlucoseReading } from "@/shared/types";

/** Combines readings, dropping duplicates (same timestamp) and anything older than the window. Oldest first. */
export function mergeHistory(existing: GlucoseReading[], incoming: GlucoseReading[], windowMinutes: number): GlucoseReading[] {
  const since = Date.now() - windowMinutes * 60_000;
  const byTime = new Map<number, GlucoseReading>();
  for (const r of [...existing, ...incoming]) {
    if (r.timestampMs >= since) byTime.set(r.timestampMs, r);
  }
  return [...byTime.values()].sort((a, b) => a.timestampMs - b.timestampMs);
}
