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

export class NightscoutClient {
  private url: string;
  private token?: string;

  constructor(url: string, token?: string) {
    this.url = url.replace(/\/+$/, "");
    this.token = token;
  }

  async connect(): Promise<void> {
    await this.getLatestReading();
  }

  async getLatestReading(): Promise<GlucoseReading | null> {
    let endpoint = `${this.url}/api/v1/entries/current.json`;
    if (this.token) {
      endpoint += `?token=${encodeURIComponent(this.token)}`;
    }

    const res = await fetch(endpoint, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Nightscout authentication failed — check your token");
      }
      throw new Error(`Nightscout error ${res.status}`);
    }

    const entries = await res.json();
    if (!Array.isArray(entries) || entries.length === 0) return null;

    const entry = entries[0];
    const trend = mapDirection(entry.direction);

    return {
      valueMgdl: entry.sgv,
      trend,
      trendArrow: TREND_ARROWS[trend],
      timestampMs: entry.date,
    };
  }
}
