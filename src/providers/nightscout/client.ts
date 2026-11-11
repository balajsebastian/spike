import type { CGMClient } from "../types";
import {
  type GlucoseReading,
  type TrendDirection,
  TREND_ARROWS,
} from "@/shared/types";

const DIRECTION_MAP: Record<string, TrendDirection> = {
  DoubleUp: "DoubleUp",
  SingleUp: "SingleUp",
  FortyFiveUp: "FortyFiveUp",
  Flat: "Flat",
  FortyFiveDown: "FortyFiveDown",
  SingleDown: "SingleDown",
  DoubleDown: "DoubleDown",
  "NOT COMPUTABLE": "NotComputable",
  "RATE OUT OF RANGE": "NotComputable",
  NONE: "None",
};

function mapDirection(direction: string | undefined): TrendDirection {
  if (!direction) return "None";
  return DIRECTION_MAP[direction] ?? "None";
}

interface NightscoutEntry {
  sgv: number;
  direction?: string;
  date: number;
}

function toReading(entry: NightscoutEntry): GlucoseReading {
  const trend = mapDirection(entry.direction);
  return {
    valueMgdl: entry.sgv,
    trend,
    trendArrow: TREND_ARROWS[trend],
    timestampMs: entry.date,
  };
}

export class NightscoutClient implements CGMClient {
  private url: string;
  private token?: string;

  constructor(url: string, token?: string) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
  }

  async connect(): Promise<void> {
    await this.getLatestReading();
  }

  private async fetchEntries(path: string, params: Record<string, string> = {}): Promise<NightscoutEntry[]> {
    const query = new URLSearchParams(params);
    if (this.token) query.set("token", this.token);
    const qs = query.toString();
    const endpoint = `${this.url}${path}${qs ? `?${qs}` : ""}`;

    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Nightscout authentication failed — check your token");
      }
      throw new Error(`Nightscout error ${res.status}`);
    }

    const entries: NightscoutEntry[] = await res.json();
    return Array.isArray(entries) ? entries : [];
  }

  async getLatestReading(): Promise<GlucoseReading | null> {
    const entries = await this.fetchEntries("/api/v1/entries/current.json");
    return entries.length > 0 ? toReading(entries[0]) : null;
  }

  async getHistory(minutes: number): Promise<GlucoseReading[]> {
    const since = Date.now() - minutes * 60_000;
    const entries = await this.fetchEntries("/api/v1/entries/sgv.json", {
      "find[date][$gte]": String(since),
      // Enough for one reading per minute (e.g. Libre uploaders).
      count: String(minutes + 10),
    });
    return entries
      .filter((e) => typeof e.sgv === "number")
      .map(toReading)
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }
}
