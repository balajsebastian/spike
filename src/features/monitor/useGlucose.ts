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

interface GlucoseState {
  reading: GlucoseReading | null;
  error: string | null;
}

export function useGlucose(credentials: Credentials) {
  const [state, setState] = useState<GlucoseState>({
    reading: null,
    error: null,
  });

  const clientRef = useRef<CGMClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef(0);
  const errorsRef = useRef(0);
  const credentialsRef = useRef(credentials);

  useEffect(() => {
    credentialsRef.current = credentials;
  }, [credentials]);

  useEffect(function setupPolling() {
    let cancelled = false;
    clientRef.current = createCGMClient(credentialsRef.current);

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

  return state;
}
