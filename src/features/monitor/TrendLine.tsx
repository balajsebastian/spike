import Svg, { Circle, Path, Rect } from "react-native-svg";
import type { GlucoseReading } from "@/shared/types";
import type { Settings, ThemeColors } from "@/features/settings/types";
import { getRangeColor } from "./utils";

// A gap longer than this breaks the line instead of drawing a straight segment across missing data.
const GAP_MS = 15 * 60_000;
const DOMAIN_PADDING = 15;
const MIN_MGDL = 40;
const MAX_MGDL = 400;
const STROKE_WIDTH = 3;
const DOT_RADIUS = 5;

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
 * The shape of the last couple of hours, so a glance tells a sudden drop from a gradual one.
 * Deliberately no axes, labels or interaction: the big number stays the main thing.
 */
export function TrendLine({ readings, windowMinutes, now, width, height, settings, theme }: Props) {
  if (readings.length < 2 || width <= 0) return null;

  const values = readings.map((r) => r.valueMgdl);
  const minY = Math.max(MIN_MGDL, Math.min(...values, settings.lowThreshold) - DOMAIN_PADDING);
  const maxY = Math.min(MAX_MGDL, Math.max(...values, settings.highThreshold) + DOMAIN_PADDING);
  const startX = now - windowMinutes * 60_000;

  // Keep the end dot fully inside the canvas.
  const pad = DOT_RADIUS + 1;
  const x = (ms: number) => pad + ((ms - startX) / (now - startX)) * (width - pad * 2);
  const y = (mgdl: number) => pad + (1 - (mgdl - minY) / (maxY - minY)) * (height - pad * 2);

  let path = "";
  readings.forEach((r, i) => {
    const gap = i > 0 && r.timestampMs - readings[i - 1].timestampMs > GAP_MS;
    path += `${i === 0 || gap ? "M" : "L"}${x(r.timestampMs).toFixed(1)},${y(r.valueMgdl).toFixed(1)} `;
  });

  const last = readings[readings.length - 1];
  const bandTop = y(Math.min(settings.highThreshold, maxY));
  const bandBottom = y(Math.max(settings.lowThreshold, minY));

  return (
    <Svg width={width} height={height}>
      <Rect
        x={0}
        y={bandTop}
        width={width}
        height={Math.max(0, bandBottom - bandTop)}
        rx={8}
        fill={theme.text}
        opacity={0.06}
      />
      <Path
        d={path}
        stroke={theme.textSecondary}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle
        cx={x(last.timestampMs)}
        cy={y(last.valueMgdl)}
        r={DOT_RADIUS}
        fill={getRangeColor(last.valueMgdl, settings, theme.text)}
      />
    </Svg>
  );
}
