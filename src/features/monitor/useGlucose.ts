import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { createCGMClient } from "@/providers/factory";
import type { CGMClient } from "@/providers/types";
import type { GlucoseReading } from "@/shared/types";
import type { Credentials } from "@/features/auth/types";

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
}

function mergeHistory(existing: GlucoseReading[], incoming: GlucoseReading[], windowMinutes: number): GlucoseReading[] {
  const since = Date.now() - windowMinutes * 60_000;
  const byTime = new Map<number, GlucoseReading>();
  for (const r of [...existing, ...incoming]) {
    if (r.timestampMs >= since) byTime.set(r.timestampMs, r);
  }
  return [...byTime.values()].sort((a, b) => a.timestampMs - b.timestampMs);
}

/** `historyMinutes` turns on the recent-readings history (for the trend line); `null` keeps it off. */
export function useGlucose(credentials: Credentials, historyMinutes: number | null = null) {
  const [state, setState] = useState<GlucoseState>({
    reading: null,
    error: null,
  });
  const [history, setHistory] = useState<GlucoseReading[]>([]);

  const clientRef = useRef<CGMClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef(0);
  const errorsRef = useRef(0);
  const credentialsRef = useRef(credentials);
  const historyMinutesRef = useRef(historyMinutes);
  const lastHistoryFetchRef = useRef(0);

  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  useEffect(function syncHistorySetting() {
    historyMinutesRef.current = historyMinutes;
    // Re-fetch the full history on the next poll.
    lastHistoryFetchRef.current = 0;
  }, [historyMinutes]);

  useEffect(function setupPolling() {
    let cancelled = false;
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
          setState({ reading, error: null });
        } else {
          setState((prev) => (prev.error ? { ...prev, error: null } : prev));
        }

        await updateHistory(client, reading);
        if (cancelled) return;

        errorsRef.current = 0;
        const isStale = reading && (Date.now() - reading.timestampMs) > STALE_THRESHOLD_MS;
        timerRef.current = setTimeout(poll, isStale ? STALE_POLL_MS : POLL_MS);
      } catch (err) {
        if (cancelled) return;
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
      if (nextState === "active") {
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

  return { ...state, history: historyMinutes === null ? NO_HISTORY : history };
}
