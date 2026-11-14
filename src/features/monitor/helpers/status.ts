import type { GlucoseReading } from "@/shared/types";
import { COLORS } from "@/shared/colors";
import { i18n } from "@/shared/lib/i18n";
import { NO_DATA_MS, STALE_MS, DELAYED_MS } from "../constants";

export function getStatusText(reading: GlucoseReading | null): { text: string; color?: string } {
  if (!reading) return { text: i18n.t("monitor.connecting") };

  const ms = Date.now() - reading.timestampMs;
  const min = Math.floor(ms / 60_000);

  if (ms > NO_DATA_MS) return { text: i18n.t("monitor.noData"), color: COLORS.danger };
  if (ms > STALE_MS) return { text: i18n.t("monitor.stale", { count: min }), color: COLORS.stale };
  if (ms > DELAYED_MS) return { text: i18n.t("monitor.delayed", { count: min }), color: COLORS.stale };
  return { text: min <= 0 ? i18n.t("monitor.justNow") : i18n.t("monitor.minutesAgo", { count: min }) };
}
