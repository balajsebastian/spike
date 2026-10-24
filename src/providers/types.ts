import type { GlucoseReading } from "@/shared/types";

export interface CGMClient {
  connect(): Promise<void>;
  getLatestReading(): Promise<GlucoseReading | null>;
}
