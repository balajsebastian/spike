import { getLocales } from "expo-localization";
import { DexcomShareClient } from "@/providers/dexcom/client";
import { LibreLinkUpClient } from "@/providers/libre/client";
import { NightscoutClient } from "@/providers/nightscout/client";
import type { DexcomRegion } from "@/providers/dexcom/types";
import type { CGMSource } from "../types";

export type LoginSource = Exclude<CGMSource, "demo">;

/** Logging in with this email opens the demo mode (for App Review and screenshots). */
export const DEMO_EMAIL = "demo@spike-cgm.app";

export const LOGIN_SOURCES: { label: string; value: LoginSource }[] = [
  { label: "Dexcom", value: "dexcom" },
  { label: "Libre", value: "libre" },
  { label: "Nightscout", value: "nightscout" },
];

export const DEXCOM_REGIONS: { label: string; value: DexcomRegion }[] = [
  { label: "EU", value: "eu" },
  { label: "US", value: "us" },
  { label: "JP", value: "jp" },
];

/** Dexcom keeps US and Japanese accounts on their own servers; everyone else is on the EU one. */
export function defaultDexcomRegion(): DexcomRegion {
  const country = getLocales()[0]?.regionCode;
  if (country === "US") return "us";
  if (country === "JP") return "jp";
  return "eu";
}

/** The client to test the login with, and the credentials to save if it works. */
export function buildConnection(source: LoginSource, field1: string, field2: string, region: DexcomRegion) {
  switch (source) {
    case "dexcom":
      return {
        client: new DexcomShareClient({ username: field1, password: field2, region }),
        credentials: { source, username: field1, password: field2, region } as const,
      };
    case "libre":
      return {
        client: new LibreLinkUpClient(field1, field2),
        credentials: { source, email: field1, password: field2 } as const,
      };
    case "nightscout": {
      const token = field2 || undefined;
      return {
        client: new NightscoutClient(field1, token),
        credentials: { source, url: field1, token } as const,
      };
    }
  }
}
