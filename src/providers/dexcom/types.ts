export type DexcomRegion = "eu" | "us" | "jp";

export interface DexcomConfig {
  username: string;
  password: string;
  region: DexcomRegion;
}

export interface RawGlucoseReading {
  WT: string;
  Value: number;
  Trend: string;
}

// "eu" is Dexcom's "outside US" server; Japan has its own server and application ID.
export const BASE_URLS: Record<DexcomRegion, string> = {
  eu: "https://shareous1.dexcom.com/ShareWebServices/Services",
  us: "https://share2.dexcom.com/ShareWebServices/Services",
  jp: "https://share.dexcom.jp/ShareWebServices/Services",
};

export const APPLICATION_IDS: Record<DexcomRegion, string> = {
  eu: "d89443d2-327c-4a6f-89e5-496bbb0317db",
  us: "d89443d2-327c-4a6f-89e5-496bbb0317db",
  jp: "d8665ade-9673-4e27-9ff6-92db4ce13d13",
};

/** Share returns this instead of an error for some failed logins. */
export const NULL_UUID = "00000000-0000-0000-0000-000000000000";
