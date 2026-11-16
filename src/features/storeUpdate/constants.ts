// Lists the runtimes (native builds) that have a newer version in the stores. Edited by hand after a store
// release, so phones still on an older build — which no longer get OTA updates — learn about it.
export const LATEST_MANIFEST_URL = "https://raw.githubusercontent.com/balajsebastian/spike/master/docs/latest.json";

export const STORE_URLS = {
  ios: "https://apps.apple.com/app/id6833041253",
  android: "https://play.google.com/store/apps/details?id=com.sebastianbalaj.spike",
} as const;

/** After "×", the banner comes back after this long. */
export const DISMISS_MS = 3 * 24 * 60 * 60_000;
export const MANIFEST_TIMEOUT_MS = 8000;
