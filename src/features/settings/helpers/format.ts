import { formatGlucose, type Settings } from "../types";

export function unitLabel(unit: Settings["unit"]): string {
  return unit === "mmol" ? "mmol/L" : "mg/dL";
}

/** "70 mg/dL" / "3.9 mmol/L" */
export function formatThreshold(mgdl: number, unit: Settings["unit"]): string {
  return `${formatGlucose(mgdl, unit)} ${unitLabel(unit)}`;
}
