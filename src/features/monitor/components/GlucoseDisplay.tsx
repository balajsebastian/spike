import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  /** Formatted value, or "--" when there is no fresh reading. */
  value: string;
  /** Hidden when there is no fresh reading. */
  trendArrow: string | null;
  /** Change over the last 5 minutes ("+5"), shown under the arrow. */
  delta: string | null;
  color: string;
  /** Shrinks on short screens (landscape) so everything below stays visible. */
  fontSize: number;
  opacity: Animated.Value;
  status: string;
  statusColor: string;
}

// The arrow keeps its proportion to the number (80 / 180).
const TREND_ARROW_RATIO = 0.45;
// Small enough that "−12" / "+0.7" stays within the arrow's width (helpers/layout.ts doesn't reserve more).
const DELTA_RATIO = 0.16;
// Tight line box around the arrow, so the delta sits right under it.
const ARROW_LINE_HEIGHT = 1.1;

function DeltaText({ delta, color, fontSize, hidden }: { delta: string; color: string; fontSize: number; hidden?: boolean }) {
  return (
    <Text
      style={[styles.delta, { color, fontSize, opacity: hidden ? 0 : 1 }]}
      numberOfLines={1}
      allowFontScaling={false}
      accessibilityElementsHidden={hidden}
      importantForAccessibility={hidden ? "no-hide-descendants" : "auto"}
    >
      {delta}
    </Text>
  );
}

/** The big number + trend arrow, and "x min ago" / stale status under it. */
export function GlucoseDisplay({ value, trendArrow, delta, color, fontSize, opacity, status, statusColor }: Props) {
  const arrowSize = fontSize * TREND_ARROW_RATIO;
  const deltaSize = fontSize * DELTA_RATIO;

  return (
    <>
      <Animated.View style={[styles.readingRow, { opacity }]}>
        <Text style={[styles.reading, { color, fontSize }]} numberOfLines={1} allowFontScaling={false}>
          {value}
        </Text>
        {trendArrow && (
          <View style={styles.trendColumn}>
            {/* An invisible copy above balances the delta below, so the arrow stays centred on the number. */}
            {delta && <DeltaText delta={delta} color={color} fontSize={deltaSize} hidden />}
            <Text
              style={[styles.trend, { color, fontSize: arrowSize, lineHeight: arrowSize * ARROW_LINE_HEIGHT }]}
              allowFontScaling={false}
            >
              {trendArrow}
            </Text>
            {delta && <DeltaText delta={delta} color={color} fontSize={deltaSize} />}
          </View>
        )}
      </Animated.View>
      <Text style={[styles.status, { color: statusColor }]} allowFontScaling={false}>
        {status}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  readingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  // The size comes from the screen (helpers/layout.ts), so the text is never auto-shrunk
  // and ignores the system text size (Larger Text would push it past the screen edge).
  reading: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
  trendColumn: {
    marginLeft: 4,
    alignItems: "center",
  },
  trend: {
    fontWeight: "700",
  },
  delta: {
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  status: {
    fontSize: 36,
  },
});
