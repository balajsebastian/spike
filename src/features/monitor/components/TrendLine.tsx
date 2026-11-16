import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { useTranslation } from "react-i18next";
import type { GlucoseReading } from "@/shared/types";
import { formatGlucose, type Settings, type ThemeColors } from "@/features/settings/types";
import { getRangeColor } from "../helpers/range";
import { bucketMinutes, trendDots, valueDomain } from "../helpers/trendChart";

const MAX_DOT_RADIUS = 4;
const MIN_DOT_RADIUS = 2;
// Dots take at most this share of the space between them, so long windows don't merge into a line.
const DOT_SPACING_RATIO = 0.35;
const LAST_DOT_RADIUS = 5;
const HALO_RADIUS = 11;
const OLDEST_OPACITY = 0.35;
const LABEL_WIDTH = 34;
const LABEL_SIZE = 12;
// Room under the dots for "12h ago … now", and the gap between them and the chart.
const TIME_AXIS_HEIGHT = 18;
const TIME_AXIS_GAP = 6;

interface Props {
  readings: GlucoseReading[];
  windowMinutes: number;
  now: number;
  width: number;
  height: number;
  settings: Settings;
  theme: ThemeColors;
}

/**
 * Dexcom-style dots for the last few hours, so a glance tells a sudden drop from a gradual one.
 * Only the low/high lines are labelled: the big number stays the main thing.
 */
export function TrendLine({ readings, windowMinutes, now, width, height, settings, theme }: Props) {
  const { t } = useTranslation();
  if (readings.length < 2 || width <= 0) return null;

  const dots = trendDots(readings, windowMinutes);
  const last = dots[dots.length - 1];
  const { minY, maxY } = valueDomain(dots, settings);
  const startX = now - windowMinutes * 60_000;

  const plotLeft = LABEL_WIDTH;
  // Leave room for the halo around the latest dot.
  const plotRight = width - HALO_RADIUS - 1;
  const plotTop = HALO_RADIUS + 1;
  const plotBottom = height - TIME_AXIS_HEIGHT - HALO_RADIUS - 1;
  const x = (ms: number) => plotLeft + ((ms - startX) / (now - startX)) * (plotRight - plotLeft);
  const dotSpacing = (plotRight - plotLeft) / (windowMinutes / bucketMinutes(windowMinutes));
  const dotRadius = Math.max(MIN_DOT_RADIUS, Math.min(MAX_DOT_RADIUS, dotSpacing * DOT_SPACING_RATIO));
  const y = (mgdl: number) => plotTop + (1 - (mgdl - minY) / (maxY - minY)) * (plotBottom - plotTop);

  const thresholds = [settings.highThreshold, settings.lowThreshold];
  // Right under whatever is lowest (the low line or a dot), not at the bottom of the padded range.
  const chartBottom = Math.max(
    y(settings.lowThreshold),
    ...dots.map((r) => y(r.valueMgdl) + dotRadius),
    y(last.valueMgdl) + HALO_RADIUS,
  );
  const timeAxisY = Math.min(height - 2, chartBottom + TIME_AXIS_GAP + LABEL_SIZE);
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
            r={dotRadius}
            fill={getRangeColor(r.valueMgdl, settings, theme.textSecondary)}
            opacity={OLDEST_OPACITY + (1 - OLDEST_OPACITY) * Math.max(0, Math.min(1, age))}
          />
        );
      })}

      <SvgText x={plotLeft} y={timeAxisY} fontSize={LABEL_SIZE} fill={theme.textTertiary} textAnchor="start">
        {t("monitor.trendStart", { count: windowMinutes / 60 })}
      </SvgText>
      <SvgText x={plotRight} y={timeAxisY} fontSize={LABEL_SIZE} fill={theme.textTertiary} textAnchor="end">
        {t("monitor.trendNow")}
      </SvgText>

      <Circle cx={x(last.timestampMs)} cy={y(last.valueMgdl)} r={HALO_RADIUS} fill={lastColor} opacity={0.25} />
      <Circle cx={x(last.timestampMs)} cy={y(last.valueMgdl)} r={LAST_DOT_RADIUS} fill={lastColor} />
    </Svg>
  );
}
