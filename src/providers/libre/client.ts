import * as Crypto from "expo-crypto";
import type { CGMClient } from "../types";
import {
  type GlucoseReading,
  type TrendDirection,
  TREND_ARROWS,
} from "@/shared/types";

const LIBRE_TREND_MAP: Record<number, TrendDirection> = {
  1: "SingleDown",
  2: "FortyFiveDown",
  3: "Flat",
  4: "FortyFiveUp",
  5: "SingleUp",
};

function mapTrend(arrow: number): TrendDirection {
  return LIBRE_TREND_MAP[arrow] ?? "None";
}

function parseTimestamp(ts: string): number {
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d.getTime();

  const match = ts.match(/(\d+)\/(\d+)\/(\d+)\s+(\d+):(\d+):(\d+)\s*(AM|PM)?/i);
  if (match) {
    const [, month, day, year, hours, minutes, seconds, ampm] = match;
    let h = parseInt(hours);
    if (ampm?.toUpperCase() === "PM" && h !== 12) h += 12;
    if (ampm?.toUpperCase() === "AM" && h === 12) h = 0;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      h,
      parseInt(minutes),
      parseInt(seconds),
    ).getTime();
  }

  return Date.now();
}

async function sha256Hex(input: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input);
}

interface LibreLoginResponse {
  data?: {
    redirect?: boolean;
    region?: string;
    authTicket?: { token: string };
    user?: { id: string | number };
  };
}

interface LibreGraphPoint {
  ValueInMgPerDl: number;
  FactoryTimestamp?: string;
  Timestamp: string;
}

interface LibreGraphResponse {
  data?: {
    connection?: { glucoseMeasurement?: LibreGraphPoint & { TrendArrow: number } };
    graphData?: LibreGraphPoint[];
  };
}

interface LibreConnectionResponse {
  data?: {
    patientId?: string;
    glucoseMeasurement?: {
      ValueInMgPerDl: number;
      TrendArrow: number;
      FactoryTimestamp?: string;
      Timestamp: string;
    };
  }[];
}

export class LibreLinkUpClient implements CGMClient {
  private baseUrl = "https://api-eu.libreview.io";
  private email: string;
  private password: string;
  private token: string | null = null;
  private accountId: string | null = null;
  private patientId: string | null = null;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
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
    this.patientId = connData.data[0].patientId ?? null;
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
    const measurement = data.data?.[0]?.glucoseMeasurement;

    if (!measurement) return null;

    const trend = mapTrend(measurement.TrendArrow);
    const timestampMs = parseTimestamp(measurement.FactoryTimestamp || measurement.Timestamp);

    return {
      valueMgdl: measurement.ValueInMgPerDl,
      trend,
      trendArrow: TREND_ARROWS[trend],
      timestampMs,
    };
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
      .map((p) => ({
        valueMgdl: p.ValueInMgPerDl,
        trend: "None" as TrendDirection,
        trendArrow: TREND_ARROWS.None,
        timestampMs: parseTimestamp(p.FactoryTimestamp || p.Timestamp),
      }))
      .filter((r) => r.timestampMs >= since)
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }
}
