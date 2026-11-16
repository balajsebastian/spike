export type StorePlatform = "ios" | "android";

export interface LatestManifest {
  outdatedRuntimes?: Partial<Record<StorePlatform, string[]>>;
}

/** Whether this native build is listed as outdated (a newer one is in the store). */
export function isOutdated(manifest: LatestManifest, platform: StorePlatform, runtimeVersion: string | null): boolean {
  if (!runtimeVersion) return false;
  return manifest.outdatedRuntimes?.[platform]?.includes(runtimeVersion) ?? false;
}

export function isDismissed(dismissedAt: number | null, now: number, dismissMs: number): boolean {
  return dismissedAt !== null && now - dismissedAt < dismissMs;
}
