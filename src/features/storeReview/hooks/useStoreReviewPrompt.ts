import { useEffect, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import * as StoreReview from "expo-store-review";
import { CALM_FOR_MS, REVIEW_AFTER_DAYS, REVIEW_AGAIN_AFTER_DAYS, REVIEW_HOURS } from "../constants";
import { isReviewDue } from "../helpers/isReviewDue";

const KEY_FIRST_SEEN = "review_first_seen_at";
const KEY_REQUESTED = "review_requested_at";

function parseTime(raw: string | null): number | null {
  const value = raw ? Number(raw) : NaN;
  return Number.isFinite(value) ? value : null;
}

/**
 * Asks for an App Store / Play rating once Spike has been used for a few days, and only after
 * things have been `calm` (in range, no alarm, daytime, portrait) for a couple of minutes.
 * At most once per launch; the system decides whether the prompt actually shows.
 */
export function useStoreReviewPrompt(calm: boolean) {
  const datesRef = useRef<{ firstSeenAt: number; requestedAt: number | null } | null>(null);
  const askedRef = useRef(false);

  useEffect(function loadReviewDates() {
    (async () => {
      const [firstSeenRaw, requestedRaw] = await Promise.all([
        SecureStore.getItemAsync(KEY_FIRST_SEEN),
        SecureStore.getItemAsync(KEY_REQUESTED),
      ]);
      let firstSeenAt = parseTime(firstSeenRaw);
      if (firstSeenAt === null) {
        firstSeenAt = Date.now();
        await SecureStore.setItemAsync(KEY_FIRST_SEEN, String(firstSeenAt));
      }
      datesRef.current = { firstSeenAt, requestedAt: parseTime(requestedRaw) };
    })().catch(() => {
      // No dates, no prompt.
    });
  }, []);

  useEffect(function askWhenCalm() {
    if (!calm || askedRef.current) return;

    const timer = setTimeout(async () => {
      const dates = datesRef.current;
      const now = Date.now();
      const hour = new Date(now).getHours();
      if (hour < REVIEW_HOURS.start || hour >= REVIEW_HOURS.end) return;
      if (!dates || !isReviewDue(dates.firstSeenAt, dates.requestedAt, now, REVIEW_AFTER_DAYS, REVIEW_AGAIN_AFTER_DAYS)) {
        return;
      }
      askedRef.current = true;
      try {
        if (!(await StoreReview.isAvailableAsync())) return;
        await SecureStore.setItemAsync(KEY_REQUESTED, String(now));
        await StoreReview.requestReview();
      } catch {
        // A rating prompt is never worth an error.
      }
    }, CALM_FOR_MS);

    // Anything un-calm (an alarm, going out of range, turning landscape) restarts the wait.
    return () => clearTimeout(timer);
  }, [calm]);
}
