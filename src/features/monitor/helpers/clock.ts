import { getCalendars, getLocales } from "expo-localization";

/** Follows the phone's 12/24-hour setting; 24-hour when the phone doesn't say. */
export function uses24HourClock(): boolean {
  return getCalendars()[0]?.uses24hourClock ?? true;
}

/** "07:05", or in 12-hour time the phone's own way ("7:05 AM", "7:05 p. m."). */
export function formatTimeOfDay(date: Date, use24Hour: boolean): string {
  if (use24Hour) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }
  return date.toLocaleTimeString(getLocales()[0]?.languageTag, { hour: "numeric", minute: "2-digit", hour12: true });
}
