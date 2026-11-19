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

/** The site couldn't be reached or isn't a Nightscout site ("notFound"), or the token was refused ("auth"). */
export class NightscoutError extends Error {
  readonly kind: "notFound" | "auth";

  constructor(kind: "notFound" | "auth", message: string) {
    super(message);
    this.name = "NightscoutError";
    this.kind = kind;
  }
}

/** "mysite.herokuapp.com/" → "https://mysite.herokuapp.com" */
function normalizeUrl(input: string): string {
  const url = input.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export class NightscoutClient implements CGMClient {
  private url: string;
  private token?: string;

  constructor(url: string, token?: string) {
    this.url = normalizeUrl(url);
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

    let res: Response;
    try {
      res = await fetch(endpoint, { headers: { Accept: "application/json" } });
    } catch {
      throw new NightscoutError("notFound", "Nightscout site unreachable");
    }

    if (!res.ok) {
      if (res.status === 401) throw new NightscoutError("auth", "Nightscout authentication failed");
      throw new NightscoutError("notFound", `Nightscout error ${res.status}`);
    }

    // A page that isn't Nightscout (wrong address) answers with HTML instead of JSON.
    const entries: unknown = await res.json().catch(() => {
      throw new NightscoutError("notFound", "Not a Nightscout site");
    });
    return Array.isArray(entries) ? (entries as NightscoutEntry[]) : [];
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
