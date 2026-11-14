import type { CGMClient } from "../types";
import type { GlucoseReading } from "@/shared/types";
import {
  type DexcomConfig,
  type RawGlucoseReading,
  APPLICATION_IDS,
  BASE_URLS,
  NULL_UUID,
} from "./types";
import { parseGlucoseReading } from "./parser";
import { CredentialsRejectedError } from "../errors";

/** Share's error body is `{ Code, Message }`. Login errors must not be retried (see CredentialsRejectedError). */
function toLoginError(status: number, text: string): Error {
  let code = "";
  let message = "";
  try {
    const body = JSON.parse(text);
    code = String(body?.Code ?? "");
    message = String(body?.Message ?? "");
  } catch {
    // Not JSON: fall through to the generic error.
  }

  if (code === "SSO_AuthenticateMaxAttemptsExceeded") {
    return new CredentialsRejectedError(`Dexcom account locked: ${code}`, true);
  }
  if (
    code === "AccountPasswordInvalid" ||
    (code === "SSO_InternalError" && message.includes("Cannot Authenticate")) ||
    (code === "InvalidArgument" && /accountName|password/i.test(message))
  ) {
    return new CredentialsRejectedError(`Dexcom login rejected: ${code}`);
  }
  return new Error(`Dexcom API error ${status}: ${text}`);
}

export class DexcomShareClient implements CGMClient {
  private baseUrl: string;
  private applicationId: string;
  private config: DexcomConfig;
  private accountId: string | null = null;
  private sessionId: string | null = null;

  constructor(config: DexcomConfig) {
    this.config = config;
    this.baseUrl = BASE_URLS[config.region];
    this.applicationId = APPLICATION_IDS[config.region];
    if (!this.baseUrl) {
      throw new Error(`Unknown region: ${config.region}. Use "eu", "us" or "jp".`);
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
      throw toLoginError(res.status, await res.text());
    }

    return res.json() as Promise<T>;
  }

  async authenticate(): Promise<string> {
    const response = await this.post<string | { accountId: string }>(
      "General/AuthenticatePublisherAccount",
      {
        accountName: this.config.username,
        password: this.config.password,
        applicationId: this.applicationId,
      }
    );

    if (typeof response === "string") {
      this.accountId = response.replace(/"/g, "");
    } else if (response && typeof response === "object" && "accountId" in response) {
      this.accountId = response.accountId;
    } else {
      throw new Error(`Unexpected auth response format: ${JSON.stringify(response)}`);
    }
    if (this.accountId === NULL_UUID) {
      throw new CredentialsRejectedError("Dexcom account not found");
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
        applicationId: this.applicationId,
      }
    );

    this.sessionId = typeof response === "string"
      ? response.replace(/"/g, "")
      : String(response);

    if (this.sessionId === NULL_UUID) {
      throw new CredentialsRejectedError("Dexcom login returned an empty session");
    }

    return this.sessionId;
  }

  async connect(): Promise<void> {
    await this.authenticate();
    await this.login();
  }

  async getLatestReading(): Promise<GlucoseReading | null> {
    const readings = await this.readValues(30, 1);
    return readings[0] ?? null;
  }

  async getHistory(minutes: number): Promise<GlucoseReading[]> {
    // Share stores one value every 5 minutes.
    const readings = await this.readValues(minutes, Math.ceil(minutes / 5) + 1);
    return readings.reverse();
  }

  /** Newest first, as returned by Share. */
  private async readValues(minutes: number, maxCount: number, retries = 1): Promise<GlucoseReading[]> {
    if (!this.sessionId) {
      await this.connect();
    }

    try {
      const raw = await this.post<RawGlucoseReading[]>(
        "Publisher/ReadPublisherLatestGlucoseValues",
        {
          sessionId: this.sessionId,
          minutes,
          maxCount,
        }
      );

      if (!Array.isArray(raw)) return [];
      return raw.map(parseGlucoseReading);
    } catch (err) {
      if (err instanceof CredentialsRejectedError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      if (retries > 0 && /Dexcom API error 50[234]/.test(msg)) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return this.readValues(minutes, maxCount, retries - 1);
      }
      if (retries > 0 && (msg.includes("500") || msg.includes("SessionNotValid") || msg.includes("SessionIdNotFound"))) {
        this.sessionId = null;
        this.accountId = null;
        await this.connect();
        return this.readValues(minutes, maxCount, retries - 1);
      }
      throw err;
    }
  }
}
