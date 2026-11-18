import type { DexcomRegion } from "@/providers/dexcom/types";

export type CGMSource = "dexcom" | "libre" | "nightscout" | "demo";

export type Credentials =
  | { source: "dexcom"; username: string; password: string; region: DexcomRegion }
  /** `patientId`: who to show, when the LibreLinkUp account follows more than one person. */
  | { source: "libre"; email: string; password: string; patientId?: string }
  | { source: "nightscout"; url: string; token?: string }
  | { source: "demo" };
