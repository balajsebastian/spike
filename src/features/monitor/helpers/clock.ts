import { getCalendars } from "expo-localization";

/** Follows the phone's 12/24-hour setting; 24-hour when the phone doesn't say. */
export function uses24HourClock(): boolean {
  return getCalendars()[0]?.uses24hourClock ?? true;
}

/** "07:05" or "7:05 AM". */
export function formatTimeOfDay(date: Date, use24Hour: boolean): string {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const hours = date.getHours();
  if (use24Hour) return `${String(hours).padStart(2, "0")}:${minutes}`;
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
}
