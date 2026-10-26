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

export class DemoClient implements CGMClient {
  private value = 110;
  private trendIndex = 0;

  async connect(): Promise<void> {}

  async getLatestReading(): Promise<GlucoseReading> {
    const trend = TRENDS[this.trendIndex % TRENDS.length];
    this.trendIndex++;

    const delta = this.getDelta(trend);
    this.value = Math.max(40, Math.min(300, this.value + delta));

    return {
      valueMgdl: Math.round(this.value),
      trend,
      trendArrow: TREND_ARROWS[trend],
      timestampMs: Date.now(),
    };
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
