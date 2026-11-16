import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Updates from "expo-updates";
import * as SecureStore from "expo-secure-store";
import { DISMISS_MS, LATEST_MANIFEST_URL, MANIFEST_TIMEOUT_MS } from "../constants";
import { isDismissed, isOutdated, type LatestManifest } from "../helpers/isOutdated";

const KEY_DISMISSED_AT = "store_update_dismissed_at";

async function fetchManifest(): Promise<LatestManifest> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MANIFEST_TIMEOUT_MS);
  try {
    const res = await fetch(LATEST_MANIFEST_URL, { signal: controller.signal, headers: { "Cache-Control": "no-cache" } });
    if (!res.ok) return {};
    return (await res.json()) as LatestManifest;
  } finally {
    clearTimeout(timer);
  }
}

/** Checks once per launch whether this build is outdated in the stores. */
export function useStoreUpdate() {
  const [available, setAvailable] = useState(false);

  useEffect(function checkForStoreUpdate() {
    const platform = Platform.OS;
    if (platform !== "ios" && platform !== "android") return;
    let cancelled = false;

    (async () => {
      try {
        const [manifest, dismissedRaw] = await Promise.all([
          fetchManifest(),
          SecureStore.getItemAsync(KEY_DISMISSED_AT),
        ]);
        if (cancelled) return;
        const dismissedAt = dismissedRaw ? Number(dismissedRaw) : null;
        setAvailable(
          isOutdated(manifest, platform, Updates.runtimeVersion) && !isDismissed(dismissedAt, Date.now(), DISMISS_MS),
        );
      } catch {
        // Offline or GitHub unreachable: just don't show the banner.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = useCallback(() => {
    setAvailable(false);
    SecureStore.setItemAsync(KEY_DISMISSED_AT, String(Date.now())).catch(() => {});
  }, []);

  return { available, dismiss };
}
