import type { GlucoseReading } from "@/shared/types";
import { formatGlucose, type Settings } from "@/features/settings/types";
import { NO_DATA_MS } from "../constants";
import { getRangeColor } from "./range";

export interface ReadingDisplay {
  /** No reading yet, or the last one is too old to trust. */
  isNoData: boolean;
  value: string;
  trendArrow: string | null;
  color: string;
}

export function getReadingDisplay(
  reading: GlucoseReading | null,
  now: number,
  settings: Settings,
  colors: { normal: string; noData: string },
): ReadingDisplay {
  if (!reading) return { isNoData: true, value: "--", trendArrow: null, color: colors.noData };

  const isNoData = now - reading.timestampMs > NO_DATA_MS;
  return {
    isNoData,
    value: isNoData ? "--" : formatGlucose(reading.valueMgdl, settings.unit),
    trendArrow: isNoData ? null : reading.trendArrow,
    color: getRangeColor(reading.valueMgdl, settings, colors.normal),
  };
}

/** Whole minutes left on the snooze, or null when not snoozed. */
export function snoozeMinutesLeft(snoozeUntil: number, now: number): number | null {
  return snoozeUntil > now ? Math.round((snoozeUntil - now) / 60_000) : null;
}

