import type { CGMClient } from "../types";
import type { GlucoseReading, TrendDirection } from "@/shared/types";
import { TREND_ARROWS } from "@/shared/types";

const TRENDS: TrendDirection[] = [
  "Flat",
  "FortyFiveUp",
  "SingleUp",
  "FortyFiveDown",
  "SingleDown",
  "Flat",
  "Flat",
  "FortyFiveUp",
  "FortyFiveDown",
  "Flat",
];

const HISTORY_STEP_MS = 5 * 60_000;
const SEEDED_HISTORY_MS = 3 * 60 * 60_000;

export class DemoClient implements CGMClient {
  private value = 110;
  private trendIndex = 0;
  private readings: GlucoseReading[] = seedHistory(this.value);

  async connect(): Promise<void> {}

  async getLatestReading(): Promise<GlucoseReading> {
    const trend = TRENDS[this.trendIndex % TRENDS.length];
    this.trendIndex++;

    const delta = this.getDelta(trend);
    this.value = Math.max(40, Math.min(300, this.value + delta));

    const reading: GlucoseReading = {
      valueMgdl: Math.round(this.value),
      trend,
      trendArrow: TREND_ARROWS[trend],
      timestampMs: Date.now(),
    };
    this.readings.push(reading);
    return reading;
  }

  async getHistory(minutes: number): Promise<GlucoseReading[]> {
    const since = Date.now() - minutes * 60_000;
    return this.readings.filter((r) => r.timestampMs >= since);
  }

  private getDelta(trend: TrendDirection): number {
    switch (trend) {
      case "DoubleUp": return 6 + Math.random() * 4;
      case "SingleUp": return 3 + Math.random() * 3;
      case "FortyFiveUp": return 1 + Math.random() * 2;
      case "Flat": return (Math.random() - 0.5) * 2;
      case "FortyFiveDown": return -(1 + Math.random() * 2);
      case "SingleDown": return -(3 + Math.random() * 3);
      case "DoubleDown": return -(6 + Math.random() * 4);
      default: return 0;
    }
  }
}

/** A gentle made-up curve leading up to the starting value, so the trend line has something to show. */
function seedHistory(endValue: number): GlucoseReading[] {
  const now = Date.now();
  const steps = SEEDED_HISTORY_MS / HISTORY_STEP_MS;
  const readings: GlucoseReading[] = [];
  for (let i = steps; i >= 1; i--) {
    const t = i / steps;
    const valueMgdl = Math.round(endValue + 45 * Math.sin(t * Math.PI * 1.5) + 20 * t);
    readings.push({
      valueMgdl,
      trend: "Flat",
      trendArrow: TREND_ARROWS.Flat,
      timestampMs: now - i * HISTORY_STEP_MS,
    });
  }
  return readings;
}
