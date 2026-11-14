import { Animated, StyleSheet, Text } from "react-native";

interface Props {
  /** Formatted value, or "--" when there is no fresh reading. */
  value: string;
  /** Hidden when there is no fresh reading. */
  trendArrow: string | null;
  color: string;
  opacity: Animated.Value;
  status: string;
  statusColor: string;
}

/** The big number + trend arrow, and "x min ago" / stale status under it. */
export function GlucoseDisplay({ value, trendArrow, color, opacity, status, statusColor }: Props) {
  return (
    <>
      <Animated.View style={[styles.readingRow, { opacity }]}>
        <Text style={[styles.reading, { color }]} adjustsFontSizeToFit numberOfLines={1}>
          {value}
        </Text>
        {trendArrow && <Text style={[styles.trend, { color }]}>{trendArrow}</Text>}
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
  reading: {
    fontSize: 180,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  trend: {
    fontSize: 80,
    fontWeight: "700",
    marginLeft: 4,
  },
  status: {
    fontSize: 36,
  },
});
