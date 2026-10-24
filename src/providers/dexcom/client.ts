import type { GlucoseReading } from "@/shared/types";
import {
  type DexcomConfig,
  type RawGlucoseReading,
  APPLICATION_ID,
  BASE_URLS,
} from "./types";
import { parseGlucoseReading } from "./parser";

export class DexcomShareClient {
  private baseUrl: string;
  private config: DexcomConfig;
  private accountId: string | null = null;
  private sessionId: string | null = null;

  constructor(config: DexcomConfig) {
    this.config = config;
    this.baseUrl = BASE_URLS[config.region];
    if (!this.baseUrl) {
      throw new Error(`Unknown region: ${config.region}. Use "eu" or "us".`);
    }
  }

  private async post<T>(endpoint: string, body: object): Promise<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dexcom API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
  }

  async authenticate(): Promise<string> {
    const response = await this.post<string | { accountId: string }>(
      "General/AuthenticatePublisherAccount",
      {
        accountName: this.config.username,
        password: this.config.password,
        applicationId: APPLICATION_ID,
      }
    );

    if (typeof response === "string") {
      this.accountId = response.replace(/"/g, "");
    } else if (response && typeof response === "object" && "accountId" in response) {
      this.accountId = response.accountId;
    } else {
      throw new Error(`Unexpected auth response format: ${JSON.stringify(response)}`);
    }

    return this.accountId;
  }

  async login(): Promise<string> {
    if (!this.accountId) {
      await this.authenticate();
    }

    const response = await this.post<string>(
      "General/LoginPublisherAccountById",
      {
        accountId: this.accountId,
        password: this.config.password,
        applicationId: APPLICATION_ID,
      }
    );

    this.sessionId = typeof response === "string"
      ? response.replace(/"/g, "")
      : String(response);

    const NULL_SESSION_ID = "00000000-0000-0000-0000-000000000000";
    if (this.sessionId === NULL_SESSION_ID) {
      throw new Error("Login returned null session ID — check credentials");
    }

    return this.sessionId;
  }

  async connect(): Promise<void> {
    await this.authenticate();
    await this.login();
  }

  async getLatestReading(retries = 1): Promise<GlucoseReading | null> {
    if (!this.sessionId) {
      await this.connect();
    }

    try {
      const raw = await this.post<RawGlucoseReading[]>(
        "Publisher/ReadPublisherLatestGlucoseValues",
        {
          sessionId: this.sessionId,
          minutes: 30,
          maxCount: 1,
        }
      );

      if (!Array.isArray(raw) || raw.length === 0) return null;
      return parseGlucoseReading(raw[0]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (retries > 0 && (msg.includes("500") || msg.includes("SessionNotValid") || msg.includes("SessionIdNotFound"))) {
        this.sessionId = null;
        this.accountId = null;
        await this.connect();
        return this.getLatestReading(retries - 1);
      }
      throw err;
    }
  }
}
