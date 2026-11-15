import { Animated, StyleSheet, Text } from "react-native";

interface Props {
  /** Formatted value, or "--" when there is no fresh reading. */
  value: string;
  /** Hidden when there is no fresh reading. */
  trendArrow: string | null;
  color: string;
  /** Shrinks on short screens (landscape) so everything below stays visible. */
  fontSize: number;
  opacity: Animated.Value;
  status: string;
  statusColor: string;
}

// The arrow keeps its proportion to the number (80 / 180).
const TREND_ARROW_RATIO = 0.45;

/** The big number + trend arrow, and "x min ago" / stale status under it. */
export function GlucoseDisplay({ value, trendArrow, color, fontSize, opacity, status, statusColor }: Props) {
  return (
    <>
      <Animated.View style={[styles.readingRow, { opacity }]}>
        <Text style={[styles.reading, { color, fontSize }]} numberOfLines={1}>
          {value}
        </Text>
        {trendArrow && <Text style={[styles.trend, { color, fontSize: fontSize * TREND_ARROW_RATIO }]}>{trendArrow}</Text>}
      </Animated.View>
      <Text style={[styles.status, { color: statusColor }]}>{status}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // The size comes from the screen (helpers/layout.ts), so the text is never auto-shrunk.
  reading: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  trend: {
    fontWeight: "700",
    marginLeft: 4,
  },
  status: {
    fontSize: 36,
  },
});
