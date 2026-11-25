import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";
import * as Brightness from "expo-brightness";

/**
 * Sets the screen's real brightness while `level` (0–1) is set, and gives the normal brightness back
 * when it's null, when Spike goes to the background and when the monitor closes.
 * iOS keeps a changed brightness system-wide until the phone locks, so the original is saved and put back.
 * Returns whether it worked, so the caller can fall back to dimming with an overlay.
 *
 * Every change runs one after the other: a dim starting while a restore is still running would otherwise
 * save the dimmed level as the "original" and leave the whole phone dim after Spike closes.
 */
export function useScreenBrightness(level: number | null): boolean {
  const [supported, setSupported] = useState(true);
  const originalRef = useRef<number | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(function applyBrightness() {
    let cancelled = false;

    const enqueue = (task: () => Promise<void>): Promise<void> => {
      const run = queueRef.current.then(task);
      queueRef.current = run.catch(() => {});
      return run;
    };

    const dim = (value: number) =>
      enqueue(async () => {
        if (originalRef.current === null) originalRef.current = await Brightness.getBrightnessAsync();
        // Never brighter than the phone already was: Spike only ever dims.
        await Brightness.setBrightnessAsync(Math.min(value, originalRef.current));
      });

    const fail = () => {
      if (!cancelled) setSupported(false);
    };

    if (level === null) enqueue(() => restoreNow(originalRef)).catch(() => {});
    else dim(level).catch(fail);

    const sub = AppState.addEventListener("change", (state) => {
      if (level === null) return;
      if (state === "active") dim(level).catch(fail);
      else enqueue(() => restoreNow(originalRef)).catch(() => {});
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [level]);

  useEffect(function restoreOnClose() {
    return () => {
      // Queued after any change still running, so it's the last word.
      const run = queueRef.current.then(() => restoreNow(originalRef));
      queueRef.current = run.catch(() => {});
    };
  }, []);

  return supported;
}

async function restoreNow(originalRef: { current: number | null }): Promise<void> {
  // Forget the original first, so nothing can read it once it's stale.
  const original = originalRef.current;
  originalRef.current = null;
  if (Platform.OS === "android") await Brightness.restoreSystemBrightnessAsync();
  else if (original !== null) await Brightness.setBrightnessAsync(original);
}
