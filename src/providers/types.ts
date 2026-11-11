import type { GlucoseReading } from "@/shared/types";

export interface CGMClient {
  connect(): Promise<void>;
  getLatestReading(): Promise<GlucoseReading | null>;
  /** Readings from the last `minutes`, oldest first. */
  getHistory(minutes: number): Promise<GlucoseReading[]>;
}
