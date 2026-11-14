import { COLORS } from "@/shared/colors";
import type { Settings } from "@/features/settings/types";
import { HIGH_BUFFER } from "../constants";

/** Red below low, normal in range, orange just above high, red well above it. */
export function getRangeColor(mgdl: number, settings: Settings, normalColor: string): string {
  if (mgdl < settings.lowThreshold) return COLORS.danger;
  if (mgdl <= settings.highThreshold) return normalColor;
  if (mgdl <= settings.highThreshold + HIGH_BUFFER) return COLORS.warning;
  return COLORS.danger;
}
