import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Brightness from "expo-brightness";

/**
 * Sets the screen's real brightness while `level` (0–1) is set, and gives the normal brightness back
 * when it's null, when Spike goes to the background and when the monitor closes.
 * iOS keeps a changed brightness system-wide until the phone locks, so the original is saved and put back.
 * Returns whether it worked, so the caller can fall back to dimming with an overlay.
 */
export function useScreenBrightness(level: number | null): boolean {
  const [supported, setSupported] = useState(true);
  const originalRef = useRef<number | null>(null);

  useEffect(function applyBrightness() {
    let cancelled = false;

    async function dim(value: number) {
      if (originalRef.current === null) originalRef.current = await Brightness.getBrightnessAsync();
      // Never brighter than the phone already was: night mode only ever dims.
      if (!cancelled) await Brightness.setBrightnessAsync(Math.min(value, originalRef.current));
    }

    async function restore() {
      if (Platform.OS === "android") {
        await Brightness.restoreSystemBrightnessAsync();
      } else if (originalRef.current !== null) {
        await Brightness.setBrightnessAsync(originalRef.current);
      }
      originalRef.current = null;
    }

    const fail = () => {
      if (!cancelled) setSupported(false);
    };

    if (level === null) restore().catch(() => {});
    else dim(level).catch(fail);

    const sub = AppState.addEventListener("change", (state) => {
      if (level === null) return;
      if (state === "active") dim(level).catch(fail);
      else restore().catch(() => {});
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [level]);

  useEffect(function restoreOnClose() {
    return () => {
      if (Platform.OS === "android") Brightness.restoreSystemBrightnessAsync().catch(() => {});
      else if (originalRef.current !== null) Brightness.setBrightnessAsync(originalRef.current).catch(() => {});
    };
  }, []);

  return supported;
}
