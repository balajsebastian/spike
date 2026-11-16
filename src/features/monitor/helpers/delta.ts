import type { GlucoseReading } from "@/shared/types";
import { mgdlToMmol } from "@/features/settings/types";

// The change is shown per 5 minutes (one Dexcom reading), the usual CGM convention.
const DELTA_MINUTES = 5;
// How far from exactly 5 minutes back the comparison reading may be (missed or early readings).
const TOLERANCE_MINUTES = 2.5;

/**
 * How much glucose changed over the last 5 minutes (mg/dL), or null when there's no reading
 * from about 5 minutes ago to compare with.
 */
export function getDelta(history: GlucoseReading[], latest: GlucoseReading | null): number | null {
  if (!latest) return null;
  const target = latest.timestampMs - DELTA_MINUTES * 60_000;

  let previous: GlucoseReading | null = null;
  for (const r of history) {
    if (r.timestampMs >= latest.timestampMs) continue;
    const off = Math.abs(r.timestampMs - target);
    if (off > TOLERANCE_MINUTES * 60_000) continue;
    if (!previous || off < Math.abs(previous.timestampMs - target)) previous = r;
  }
  if (!previous) return null;

  // A reading 4 or 6 minutes back is scaled to 5, so the number means the same thing for every source.
  const minutes = (latest.timestampMs - previous.timestampMs) / 60_000;
  return ((latest.valueMgdl - previous.valueMgdl) * DELTA_MINUTES) / minutes;
}

/** "+5", "−12", "±0" (or "+0.3" in mmol/L). */
export function formatDelta(deltaMgdl: number, unit: "mgdl" | "mmol"): string {
  const value = unit === "mmol" ? mgdlToMmol(Math.abs(deltaMgdl)) : Math.round(Math.abs(deltaMgdl));
  if (value === 0) return unit === "mmol" ? "±0.0" : "±0";
  const sign = deltaMgdl > 0 ? "+" : "−";
  return `${sign}${unit === "mmol" ? value.toFixed(1) : value}`;
}
