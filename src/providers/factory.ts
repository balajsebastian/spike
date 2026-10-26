import { DexcomShareClient } from "./dexcom/client";
import { LibreLinkUpClient } from "./libre/client";
import { NightscoutClient } from "./nightscout/client";
import { DemoClient } from "./demo/client";
import type { CGMClient } from "./types";
import type { Credentials } from "@/features/auth/types";

export function createCGMClient(credentials: Credentials): CGMClient {
  switch (credentials.source) {
    case "dexcom":
      return new DexcomShareClient(credentials);
    case "libre":
      return new LibreLinkUpClient(credentials.email, credentials.password);
    case "nightscout":
      return new NightscoutClient(credentials.url, credentials.token);
    case "demo":
      return new DemoClient();
  }
}
