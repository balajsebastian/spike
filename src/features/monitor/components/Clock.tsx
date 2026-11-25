import { StyleSheet, Text } from "react-native";
import type { ThemeColors } from "@/features/settings/types";
import { useMinuteClock } from "../hooks/useMinuteClock";
import { formatTimeOfDay, uses24HourClock } from "../helpers/clock";

interface Props {
  top: number;
  theme: ThemeColors;
}

/** The time of day at the top of the monitor; the status bar (and its clock) is hidden there. */
export function Clock({ top, theme }: Props) {
  const now = useMinuteClock();

  return (
    <Text style={[styles.clock, { top: top + 8, color: theme.textSecondary }]} allowFontScaling={false}>
      {formatTimeOfDay(now, uses24HourClock())}
    </Text>
  );
}

const styles = StyleSheet.create({
  clock: {
    position: "absolute",
    alignSelf: "center",
    fontSize: 40,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
});
