import { StyleSheet } from "react-native";

export const ICON_SIZE = 30;
export const ROW_PADDING = 16;
export const ICON_GAP = 12;

/** Shared styles for the iOS-style grouped lists (settings, sound picker). */
export const listStyles = StyleSheet.create({
  section: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: ROW_PADDING,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionFooter: {
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: ROW_PADDING,
    paddingTop: 8,
  },
  card: {
    borderRadius: 22,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: ROW_PADDING + ICON_SIZE + ICON_GAP,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ROW_PADDING,
    paddingVertical: 10,
    minHeight: 52,
  },
  rowLeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: ICON_GAP,
    flexShrink: 1,
  },
  iconBadge: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: 8,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  rowLabel: {
    fontSize: 16,
    flexShrink: 1,
  },
  rowTrailing: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  navTrailing: {
    gap: 4,
    flexShrink: 1,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 2,
  },
  segmentedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderCurve: "continuous",
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: "600",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderCurve: "continuous",
    padding: 2,
  },
  stepperBtn: {
    width: 34,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: "500",
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 78,
    textAlign: "center",
    fontVariant: ["tabular-nums"],
  },
});
