import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { createCGMClient } from "@/providers/factory";
import type { CGMClient } from "@/providers/types";
import { CredentialsRejectedError } from "@/providers/errors";
import type { GlucoseReading } from "@/shared/types";
import type { Credentials } from "@/features/auth/types";
import { mergeHistory } from "../helpers/history";

const POLL_MS = 60_000;
const STALE_POLL_MS = 15_000;
const STALE_THRESHOLD_MS = 6 * 60_000;
const MAX_BACKOFF_MS = 30_000;
// New readings are appended locally; the full history is re-fetched now and then to fill any gaps.
const HISTORY_REFRESH_MS = 15 * 60_000;
const NO_HISTORY: GlucoseReading[] = [];

interface GlucoseState {
  reading: GlucoseReading | null;
  error: string | null;
  /** The saved login stopped working; polling is stopped until the user logs in again. */
  credentialsRejected: "invalid" | "locked" | null;
  /** At least one poll succeeded, so a missing reading means the account has none (not that we're still connecting). */
  connected: boolean;
}

/** `historyMinutes` turns on the recent-readings history (for the trend line); `null` keeps it off. */
export function useGlucose(credentials: Credentials, historyMinutes: number | null = null) {
  const [state, setState] = useState<GlucoseState>({
    reading: null,
    error: null,
    credentialsRejected: null,
    connected: false,
  });
  const [history, setHistory] = useState<GlucoseReading[]>([]);
  // When we last asked the CGM for data (successfully or not). The no-data alarm is only checked after a
  // real poll, so coming back from the background doesn't ring before the fresh reading has had a chance to load.
  const [polledAt, setPolledAt] = useState(0);

  const clientRef = useRef<CGMClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef(0);
  const errorsRef = useRef(0);
  const stoppedRef = useRef(false);
  const credentialsRef = useRef(credentials);
  const historyMinutesRef = useRef(historyMinutes);
  const lastHistoryFetchRef = useRef(0);

  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  useEffect(function syncHistorySetting() {
    const previous = historyMinutesRef.current;
    historyMinutesRef.current = historyMinutes;
    // Re-fetch the full history on the next poll.
    lastHistoryFetchRef.current = 0;

    // Just turned on or showing more hours: fetch now instead of leaving the chart short until the next poll.
    const client = clientRef.current;
    if (historyMinutes === null || !client || stoppedRef.current) return;
    if (previous !== null && historyMinutes <= previous) return;
    let cancelled = false;
    client
      .getHistory(historyMinutes)
      .then((fetched) => {
        if (cancelled) return;
        lastHistoryFetchRef.current = Date.now();
        setHistory((prev) => mergeHistory(prev, fetched, historyMinutes));
      })
      .catch(() => {
        // The next poll tries again.
      });
    return () => {
      cancelled = true;
    };
  }, [historyMinutes]);

  useEffect(function setupPolling() {
    let cancelled = false;
    stoppedRef.current = false;
    clientRef.current = createCGMClient(credentialsRef.current);

    async function updateHistory(client: CGMClient, reading: GlucoseReading | null) {
      const minutes = historyMinutesRef.current;
      if (minutes === null) return;

      if (Date.now() - lastHistoryFetchRef.current > HISTORY_REFRESH_MS) {
        try {
          const fetched = await client.getHistory(minutes);
          if (cancelled) return;
          lastHistoryFetchRef.current = Date.now();
          setHistory((prev) => mergeHistory(prev, reading ? [...fetched, reading] : fetched, minutes));
          return;
        } catch {
          // The trend line is a nice-to-have: keep the alarm path going and try again on the next poll.
        }
      }
      if (reading) setHistory((prev) => mergeHistory(prev, [reading], minutes));
    }

    async function poll() {
      const client = clientRef.current;
      if (!client) return;

      try {
        const reading = await client.getLatestReading();
        if (cancelled) return;

        if (reading && reading.timestampMs !== lastTimestampRef.current) {
          lastTimestampRef.current = reading.timestampMs;
          setState({ reading, error: null, credentialsRejected: null, connected: true });
        } else {
          setState((prev) => (prev.error || !prev.connected ? { ...prev, error: null, connected: true } : prev));
        }

        await updateHistory(client, reading);
        if (cancelled) return;

        setPolledAt(Date.now());
        errorsRef.current = 0;
        const isStale = reading && (Date.now() - reading.timestampMs) > STALE_THRESHOLD_MS;
        timerRef.current = setTimeout(poll, isStale ? STALE_POLL_MS : POLL_MS);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof CredentialsRejectedError) {
          // Every retry is another failed login on the user's real CGM account: stop until they log in again.
          stoppedRef.current = true;
          setState((prev) => ({ ...prev, error: null, credentialsRejected: err.locked ? "locked" : "invalid" }));
          return;
        }
        setPolledAt(Date.now());
        errorsRef.current++;
        const backoff = Math.min(
          POLL_MS * Math.pow(2, errorsRef.current - 1),
          MAX_BACKOFF_MS
        );
        const msg = err instanceof Error ? err.message : String(err);
        setState((prev) => ({ ...prev, error: msg }));
        timerRef.current = setTimeout(poll, backoff);
      }
    }

    poll();

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && !stoppedRef.current) {
        if (timerRef.current) clearTimeout(timerRef.current);
        poll();
      }
    });

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
      sub.remove();
    };
  }, [credentials.source]);

  return { ...state, polledAt, history: historyMinutes === null ? NO_HISTORY : history };
}
