export type CGMSource = "dexcom" | "libre" | "nightscout" | "demo";

export type Credentials =
  | { source: "dexcom"; username: string; password: string; region: "eu" | "us" }
  | { source: "libre"; email: string; password: string }
  | { source: "nightscout"; url: string; token?: string }
  | { source: "demo" };
