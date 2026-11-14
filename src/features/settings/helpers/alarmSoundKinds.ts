import { ArrowDown, ArrowUp, ArrowUpDown, ChevronsDown, ChevronsUp, type LucideIcon } from "lucide-react-native";
import type { AlarmSoundKind } from "../types";

/** Label (i18n key) and icon for each alarm sound row, matching the rows in Alert Types. */
export const ALARM_SOUND_KIND_INFO: Record<AlarmSoundKind, { labelKey: string; icon: LucideIcon }> = {
  urgentLow: { labelKey: "settings.urgentLow", icon: ChevronsDown },
  low: { labelKey: "settings.low", icon: ArrowDown },
  high: { labelKey: "settings.high", icon: ArrowUp },
  urgentHigh: { labelKey: "settings.urgentHigh", icon: ChevronsUp },
  trend: { labelKey: "settings.rapidChange", icon: ArrowUpDown },
};
