import { useEffect, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { WHATS_NEW_ITEMS } from "../constants";
import { hasSeenWhatsNew, markWhatsNewSeen } from "../storage";

/**
 * Opens "What's new" once after an update. Waits for portrait: landscape is the nightstand view.
 * It runs at launch, before the first reading (and so any alarm) has loaded.
 */
export function useWhatsNewOnce() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const checkedRef = useRef(false);

  useEffect(function showWhatsNewOnce() {
    if (checkedRef.current || isLandscape || WHATS_NEW_ITEMS.length === 0) return;
    checkedRef.current = true;
    let cancelled = false;

    hasSeenWhatsNew()
      .then(async (seen) => {
        if (seen || cancelled) return;
        await markWhatsNewSeen();
        router.push("/whats-new");
      })
      .catch(() => {
        // Not worth bothering anyone over.
      });

    return () => {
      cancelled = true;
    };
  }, [isLandscape]);
}
