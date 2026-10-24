import type { GlucoseReading } from "@/shared/types";
import { COLORS } from "@/shared/colors";
import type { Settings } from "@/features/settings/types";
import { NO_DATA_MS, STALE_MS, DELAYED_MS, HIGH_BUFFER } from "./constants";

export function getRangeColor(mgdl: number, settings: Settings, normalColor: string): string {
  if (mgdl < settings.urgentLowThreshold) return COLORS.danger;
  if (mgdl < settings.lowThreshold) return COLORS.warning;
  if (mgdl <= settings.highThreshold) return normalColor;
  if (mgdl <= settings.highThreshold + HIGH_BUFFER) return COLORS.warning;
  return COLORS.danger;
}

export function getStatusText(reading: GlucoseReading | null): { text: string; color?: string } {
  if (!reading) return { text: "CONNECTING..." };

  const ms = Date.now() - reading.timestampMs;
  const min = Math.floor(ms / 60_000);

  if (ms > NO_DATA_MS) return { text: "NO DATA", color: COLORS.danger };
  if (ms > STALE_MS) return { text: `STALE · ${min}m ago`, color: COLORS.stale };
  if (ms > DELAYED_MS) return { text: `DELAYED · ${min}m ago`, color: COLORS.stale };
  return { text: min <= 0 ? "just now" : `${min} min ago` };
}
