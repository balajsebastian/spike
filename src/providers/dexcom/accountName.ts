import type { DexcomRegion } from "./types";

const UUID = /^([0-9a-f]{8})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{4})-?([0-9a-f]{12})$/i;
const PHONE = /^\+?[\d\s().-]{7,}$/;

/**
 * The account ID (a UUID from the Dexcom account page URL), hyphenated, or null if `input` isn't one.
 * Some accounts can't log in to Share with their email or phone, only with this ID.
 */
export function toAccountId(input: string): string | null {
  const match = input.trim().match(UUID);
  return match ? match.slice(1).join("-").toLowerCase() : null;
}

/**
 * Share wants phone numbers as +<country code><number>, with nothing in between.
 * A 10-digit number on the US server gets +1; anything else that isn't a phone number is left as typed.
 */
export function normalizeAccountName(input: string, region: DexcomRegion): string {
  const value = input.trim();
  if (!PHONE.test(value)) return value;
  const digits = value.replace(/\D/g, "");
  if (value.startsWith("+")) return `+${digits}`;
  if (region === "us" && digits.length === 10) return `+1${digits}`;
  if (region === "us" && digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return value;
}
