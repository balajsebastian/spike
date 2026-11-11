import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import type { GlucoseReading } from "@/shared/types";
import { formatGlucose, type Settings, type ThemeColors } from "@/features/settings/types";
import { getRangeColor } from "./utils";

// One dot per 5 minutes keeps 1-minute sources (e.g. Libre) from turning into a smear.
const BUCKET_MS = 5 * 60_000;
const DOMAIN_PADDING = 20;
const MIN_MGDL = 40;
const MAX_MGDL = 400;
const DOT_RADIUS = 4;
const LAST_DOT_RADIUS = 5;
const HALO_RADIUS = 11;
const OLDEST_OPACITY = 0.35;
const LABEL_WIDTH = 34;
const LABEL_SIZE = 12;

interface Props {
  readings: GlucoseReading[];
  windowMinutes: number;
  now: number;
  width: number;
  height: number;
  settings: Settings;
  theme: ThemeColors;
}

function bucketReadings(readings: GlucoseReading[]): GlucoseReading[] {
  const buckets = new Map<number, GlucoseReading>();
  for (const r of readings) {
    // Later readings win, so each bucket keeps its most recent value.
    buckets.set(Math.floor(r.timestampMs / BUCKET_MS), r);
  }
  return [...buckets.values()];
}

/**
 * Dexcom-style dots for the last couple of hours, so a glance tells a sudden drop from a gradual one.
 * Only the low/high lines are labelled: the big number stays the main thing.
 */
export function TrendLine({ readings, windowMinutes, now, width, height, settings, theme }: Props) {
  if (readings.length < 2 || width <= 0) return null;

  const dots = bucketReadings(readings);
  const last = readings[readings.length - 1];
  if (dots[dots.length - 1] !== last) dots.push(last);

  const values = dots.map((r) => r.valueMgdl);
  const minY = Math.max(MIN_MGDL, Math.min(...values, settings.lowThreshold) - DOMAIN_PADDING);
  const maxY = Math.min(MAX_MGDL, Math.max(...values, settings.highThreshold) + DOMAIN_PADDING);
  const startX = now - windowMinutes * 60_000;

  const plotLeft = LABEL_WIDTH;
  // Leave room for the halo around the latest dot.
  const plotRight = width - HALO_RADIUS - 1;
  const plotTop = HALO_RADIUS + 1;
  const plotBottom = height - HALO_RADIUS - 1;
  const x = (ms: number) => plotLeft + ((ms - startX) / (now - startX)) * (plotRight - plotLeft);
  const y = (mgdl: number) => plotTop + (1 - (mgdl - minY) / (maxY - minY)) * (plotBottom - plotTop);

  const thresholds = [settings.highThreshold, settings.lowThreshold];
  const lastColor = getRangeColor(last.valueMgdl, settings, theme.text);

  return (
    <Svg width={width} height={height}>
      {thresholds.map((mgdl) => (
        <Line
          key={`line-${mgdl}`}
          x1={plotLeft}
          x2={plotRight}
          y1={y(mgdl)}
          y2={y(mgdl)}
          stroke={theme.textTertiary}
          strokeWidth={1}
          strokeDasharray="4 6"
        />
      ))}
      {thresholds.map((mgdl) => (
        <SvgText
          key={`label-${mgdl}`}
          x={0}
          y={y(mgdl) + LABEL_SIZE / 3}
          fontSize={LABEL_SIZE}
          fontWeight="600"
          fill={theme.textTertiary}
        >
          {formatGlucose(mgdl, settings.unit)}
        </SvgText>
      ))}

      {dots.slice(0, -1).map((r) => {
        // Older readings fade out so the eye lands on the recent end.
        const age = (r.timestampMs - startX) / (now - startX);
        return (
          <Circle
            key={r.timestampMs}
            cx={x(r.timestampMs)}
            cy={y(r.valueMgdl)}
            r={DOT_RADIUS}
            fill={getRangeColor(r.valueMgdl, settings, theme.textSecondary)}
            opacity={OLDEST_OPACITY + (1 - OLDEST_OPACITY) * Math.max(0, Math.min(1, age))}
          />
        );
      })}

      <Circle cx={x(last.timestampMs)} cy={y(last.valueMgdl)} r={HALO_RADIUS} fill={lastColor} opacity={0.25} />
      <Circle cx={x(last.timestampMs)} cy={y(last.valueMgdl)} r={LAST_DOT_RADIUS} fill={lastColor} />
    </Svg>
  );
}
