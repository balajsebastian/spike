import * as Crypto from "expo-crypto";
import type { CGMClient } from "../types";
import { CredentialsRejectedError } from "../errors";
import type { GlucoseReading } from "@/shared/types";
import type {
  LibreConnectionResponse,
  LibreGraphPoint,
  LibreGraphResponse,
  LibreLoginResponse,
  LibrePerson,
} from "./types";
import { parseGraphPoint, parseMeasurement } from "./parser";

async function sha256Hex(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

export class LibreLinkUpClient implements CGMClient {
  private baseUrl = "https://api-eu.libreview.io";
  private email: string;
  private password: string;
  private token: string | null = null;
  private accountId: string | null = null;
  private patientId: string | null = null;
  private preferredPatientId: string | undefined;
  /** Everyone the account follows, filled in by `connect`. */
  people: LibrePerson[] = [];

  /** `patientId` picks who to show when the account follows more than one person; otherwise the first. */
  constructor(email: string, password: string, patientId?: string) {
    this.email = email;
    this.password = password;
    this.preferredPatientId = patientId;
  }

  /** The connection of the person being shown (the chosen one, or the first). */
  private pickConnection(data: LibreConnectionResponse["data"]) {
    return data?.find((c) => c.patientId === this.patientId) ?? data?.[0];
  }

  private headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "cache-control": "no-cache",
      product: "llu.android",
      version: "4.16.0",
    };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    if (this.accountId) headers["Account-Id"] = this.accountId;
    return headers;
  }

  async connect(redirects = 2): Promise<void> {
    const loginRes = await fetch(`${this.baseUrl}/llu/auth/login`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ email: this.email, password: this.password }),
    });

    if (!loginRes.ok) {
      throw new Error(`LibreLinkUp login failed (${loginRes.status})`);
    }

    const loginData: LibreLoginResponse = await loginRes.json();
    if (loginData.status === 2) {
      throw new CredentialsRejectedError("LibreLinkUp login rejected");
    }

    if (loginData.data?.redirect && loginData.data?.region) {
      if (redirects <= 0) throw new Error("LibreLinkUp too many redirects");
      this.baseUrl = `https://api-${loginData.data.region}.libreview.io`;
      return this.connect(redirects - 1);
    }

    if (!loginData.data?.authTicket?.token) {
      throw new Error("LibreLinkUp authentication failed — check credentials");
    }

    this.token = loginData.data.authTicket.token;

    const userId = loginData.data.user?.id;
    if (userId) {
      this.accountId = await sha256Hex(String(userId));
    }

    const connRes = await fetch(`${this.baseUrl}/llu/connections`, {
      headers: this.headers(),
    });
    const connData: LibreConnectionResponse = await connRes.json();

    if (!connData.data?.length) {
      throw new Error("No connections found in LibreLinkUp — add a connection in the LibreLinkUp app first");
    }
    this.people = connData.data.flatMap(({ patientId, firstName, lastName }) =>
      patientId ? [{ patientId, name: [firstName, lastName].filter(Boolean).join(" ") || patientId }] : [],
    );
    const preferred = this.people.find((p) => p.patientId === this.preferredPatientId);
    this.patientId = preferred?.patientId ?? connData.data[0].patientId ?? null;
  }

  async getLatestReading(retries = 1): Promise<GlucoseReading | null> {
    if (!this.token) await this.connect();

    const res = await fetch(`${this.baseUrl}/llu/connections`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      if (retries > 0 && (res.status === 401 || res.status === 403)) {
        this.token = null;
        this.accountId = null;
        await this.connect();
        return this.getLatestReading(retries - 1);
      }
      throw new Error(`LibreLinkUp error ${res.status}`);
    }

    const data: LibreConnectionResponse = await res.json();
    const measurement = this.pickConnection(data.data)?.glucoseMeasurement;

    return measurement ? parseMeasurement(measurement) : null;
  }

  async getHistory(minutes: number, retries = 1): Promise<GlucoseReading[]> {
    if (!this.token || !this.patientId) await this.connect();
    if (!this.patientId) return [];

    const res = await fetch(`${this.baseUrl}/llu/connections/${this.patientId}/graph`, {
      headers: this.headers(),
    });

    if (!res.ok) {
      if (retries > 0 && (res.status === 401 || res.status === 403)) {
        this.token = null;
        this.accountId = null;
        await this.connect();
        return this.getHistory(minutes, retries - 1);
      }
      throw new Error(`LibreLinkUp error ${res.status}`);
    }

    const data: LibreGraphResponse = await res.json();
    const points: LibreGraphPoint[] = [...(data.data?.graphData ?? [])];
    const current = data.data?.connection?.glucoseMeasurement;
    if (current) points.push(current);

    const since = Date.now() - minutes * 60_000;
    return points
      .map(parseGraphPoint)
      .filter((r) => r.timestampMs >= since)
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }
}
