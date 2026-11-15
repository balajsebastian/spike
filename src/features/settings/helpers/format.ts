import { formatGlucose, type Settings } from "../types";

export function unitLabel(unit: Settings["unit"]): string {
  return unit === "mmol" ? "mmol/L" : "mg/dL";
}

/** "70 mg/dL" / "3.9 mmol/L" */
export function formatThreshold(mgdl: number, unit: Settings["unit"]): string {
  return `${formatGlucose(mgdl, unit)} ${unitLabel(unit)}`;
}

/** Minutes after midnight as "23:00". */
export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
