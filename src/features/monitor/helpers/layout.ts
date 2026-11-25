const MAX_READING_FONT = 180;
const MIN_READING_FONT = 72;
const LINE_HEIGHT_RATIO = 1.25;
const STATUS_HEIGHT = 48;
const SNOOZE_HEIGHT = 64;
/** Space kept free at the top for the clock. */
export const CLOCK_HEIGHT = 64;
const VERTICAL_PADDING = 40;
const TREND_GAP = 24;
const SIDE_MARGIN = 24;
const STACKED_TREND = { maxWidth: 640, portraitHeight: 150 };
const SPLIT_TREND_MAX_HEIGHT = 220;
// Width of the reading relative to the font size: 3 bold tabular digits (~0.62 em each),
// the decimal point in mmol/L ("10.5"), and the arrow (45% of the font, ~1 em wide) with its margin.
const DIGIT_EM = 0.62;
const DECIMAL_POINT_EM = 0.3;
const ARROW_EM = 0.45 + 0.05;
const READING_SIDE_PADDING = 40;

function readingWidthEm(unit: "mgdl" | "mmol"): number {
  return 3 * DIGIT_EM + (unit === "mmol" ? DECIMAL_POINT_EM : 0) + ARROW_EM;
}

export interface MonitorLayout {
  /** Landscape with the trend line: number on the left, chart on the right, so the number stays big. */
  split: boolean;
  /** Width of each column when split. */
  columnWidth: number | null;
  readingFontSize: number;
  trend: { width: number; height: number } | null;
}

interface Input {
  width: number;
  height: number;
  insets: { top: number; bottom: number; left: number; right: number };
  showTrend: boolean;
  reserveSnooze: boolean;
  showClock: boolean;
  unit: "mgdl" | "mmol";
}

/**
 * The number takes whatever height is left once everything under it has its space,
 * and never gets wider than its column (number and arrow scale together).
 */
function fitReadingFontSize(
  availableHeight: number,
  reservedBelow: number,
  availableWidth: number,
  unit: "mgdl" | "mmol",
): number {
  const byHeight = (availableHeight - STATUS_HEIGHT - VERTICAL_PADDING - reservedBelow) / LINE_HEIGHT_RATIO;
  const byWidth = (availableWidth - READING_SIDE_PADDING) / readingWidthEm(unit);
  return Math.round(Math.max(MIN_READING_FONT, Math.min(MAX_READING_FONT, byHeight, byWidth)));
}

export function getMonitorLayout({ width, height, insets, showTrend, reserveSnooze, showClock, unit }: Input): MonitorLayout {
  const availableHeight = height - insets.top - insets.bottom - (showClock ? CLOCK_HEIGHT : 0);
  const availableWidth = width - insets.left - insets.right;
  const snooze = reserveSnooze ? SNOOZE_HEIGHT : 0;
  const isLandscape = width > height;

  if (!showTrend) {
    return { split: false, columnWidth: null, readingFontSize: fitReadingFontSize(availableHeight, snooze, availableWidth, unit), trend: null };
  }

  if (isLandscape) {
    const columnWidth = Math.floor(availableWidth / 2);
    return {
      split: true,
      columnWidth,
      readingFontSize: fitReadingFontSize(availableHeight, snooze, columnWidth, unit),
      trend: {
        width: columnWidth - 2 * SIDE_MARGIN,
        height: Math.min(SPLIT_TREND_MAX_HEIGHT, availableHeight - snooze - VERTICAL_PADDING),
      },
    };
  }

  const trendHeight = STACKED_TREND.portraitHeight;
  return {
    split: false,
    columnWidth: null,
    readingFontSize: fitReadingFontSize(availableHeight, snooze + trendHeight + TREND_GAP, availableWidth, unit),
    trend: { width: Math.min(availableWidth - 2 * SIDE_MARGIN, STACKED_TREND.maxWidth), height: trendHeight },
  };
}
