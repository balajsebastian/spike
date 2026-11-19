import { Palette, SunDim, Volume2, type LucideIcon } from "lucide-react-native";

/**
 * Change this (and the items) to show "What's new" again after an update.
 * Not the app version: OTA updates keep the same store version.
 */
export const WHATS_NEW_ID = "2026-11-1.2";

/**
 * Each key has a title and body under `whatsNew.items.<key>`.
 * `perPlatform` items use `body_ios` / `body_android` instead, when the feature differs.
 * Leave empty to skip the sheet for a release.
 */
export const WHATS_NEW_ITEMS: { key: string; icon: LucideIcon; perPlatform?: boolean }[] = [
  { key: "brightness", icon: SunDim },
  { key: "volume", icon: Volume2, perPlatform: true },
  { key: "coloredValues", icon: Palette },
];
