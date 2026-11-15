const MAX_READING_FONT = 180;
const MIN_READING_FONT = 72;
const LINE_HEIGHT_RATIO = 1.25;
const STATUS_HEIGHT = 48;
const SNOOZE_HEIGHT = 64;
const VERTICAL_PADDING = 40;
const TREND_GAP = 24;
const SIDE_MARGIN = 24;
const STACKED_TREND = { maxWidth: 640, portraitHeight: 150 };
const SPLIT_TREND_MAX_HEIGHT = 220;

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
}

/** The number takes whatever height is left once everything under it has its space. */
function fitReadingFontSize(availableHeight: number, reservedBelow: number): number {
  const fit = (availableHeight - STATUS_HEIGHT - VERTICAL_PADDING - reservedBelow) / LINE_HEIGHT_RATIO;
  return Math.round(Math.max(MIN_READING_FONT, Math.min(MAX_READING_FONT, fit)));
}

export function getMonitorLayout({ width, height, insets, showTrend, reserveSnooze }: Input): MonitorLayout {
  const availableHeight = height - insets.top - insets.bottom;
  const availableWidth = width - insets.left - insets.right;
  const snooze = reserveSnooze ? SNOOZE_HEIGHT : 0;
  const isLandscape = width > height;

  if (!showTrend) {
    return { split: false, columnWidth: null, readingFontSize: fitReadingFontSize(availableHeight, snooze), trend: null };
  }

  if (isLandscape) {
    const columnWidth = Math.floor(availableWidth / 2);
    return {
      split: true,
      columnWidth,
      readingFontSize: fitReadingFontSize(availableHeight, snooze),
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
    readingFontSize: fitReadingFontSize(availableHeight, snooze + trendHeight + TREND_GAP),
    trend: { width: Math.min(availableWidth - 2 * SIDE_MARGIN, STACKED_TREND.maxWidth), height: trendHeight },
  };
}
