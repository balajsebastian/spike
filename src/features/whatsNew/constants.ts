import { ArrowDownToLine, Diff, History, Info, WifiOff, type LucideIcon } from "lucide-react-native";

/**
 * Change this (and the items) to show "What's new" again after an update.
 * Not the app version: OTA updates keep the same store version.
 */
export const WHATS_NEW_ID = "2026-11";

/** Each key has a title and body under `whatsNew.items.<key>`. Leave empty to skip the sheet for a release. */
export const WHATS_NEW_ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: "noData", icon: WifiOff },
  { key: "predicted", icon: ArrowDownToLine },
  { key: "delta", icon: Diff },
  { key: "trendWindow", icon: History },
  { key: "info", icon: Info },
];
