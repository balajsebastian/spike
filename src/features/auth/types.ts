import type { DexcomRegion } from "@/providers/dexcom/types";

export type CGMSource = "dexcom" | "libre" | "nightscout" | "demo";

export type Credentials =
  | { source: "dexcom"; username: string; password: string; region: DexcomRegion }
  | { source: "libre"; email: string; password: string }
  | { source: "nightscout"; url: string; token?: string }
  | { source: "demo" };
