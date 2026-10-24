export interface DexcomConfig {
  username: string;
  password: string;
  region: "eu" | "us";
}

export interface RawGlucoseReading {
  WT: string;
  Value: number;
  Trend: string;
}

export const BASE_URLS: Record<DexcomConfig["region"], string> = {
  eu: "https://shareous1.dexcom.com/ShareWebServices/Services",
  us: "https://share2.dexcom.com/ShareWebServices/Services",
};

export const APPLICATION_ID = "d89443d2-327c-4a6f-89e5-496bbb0317db";
