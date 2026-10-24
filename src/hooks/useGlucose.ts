import { useEffect, useRef, useState, useCallback } from "react";
import { AppState } from "react-native";
import { DexcomShareClient } from "../dexcom/share-client";
import { LibreLinkUpClient } from "../libre/libre-client";
import { NightscoutClient } from "../nightscout/nightscout-client";
import type { GlucoseReading } from "../dexcom/types";
import type { Credentials } from "./useCredentials";

const POLL_INTERVAL_MS = 60_000;
const STALE_POLL_INTERVAL_MS = 15_000;
const STALE_THRESHOLD_MS = 6 * 60_000;
const MAX_BACKOFF_MS = 30_000;
interface CGMClient {
  getLatestReading(): Promise<GlucoseReading | null>;
}

function createClient(credentials: Credentials): CGMClient {
  switch (credentials.source) {
    case "dexcom":
      return new DexcomShareClient(credentials);
    case "libre":
      return new LibreLinkUpClient(credentials.email, credentials.password);
    case "nightscout":
      return new NightscoutClient(credentials.url, credentials.token);
  }
}

interface GlucoseState {
  reading: GlucoseReading | null;
  error: string | null;
  connected: boolean;
}

export function useGlucose(credentials: Credentials) {
  const [state, setState] = useState<GlucoseState>({
    reading: null,
    error: null,
    connected: false,
  });

  const clientRef = useRef<CGMClient | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTimestampRef = useRef(0);
  const errorsRef = useRef(0);

  const poll = useCallback(async () => {
    if (!clientRef.current) return;

    try {
      const reading = await clientRef.current.getLatestReading();

      if (reading && reading.sensorTimestampMs !== lastTimestampRef.current) {
        lastTimestampRef.current = reading.sensorTimestampMs;
        setState({ reading, error: null, connected: true });
      } else if (!reading) {
        setState((prev) => ({ ...prev, error: null, connected: true }));
      }

      errorsRef.current = 0;
      const isStale = reading && (Date.now() - reading.sensorTimestampMs) > STALE_THRESHOLD_MS;
      timerRef.current = setTimeout(poll, isStale ? STALE_POLL_INTERVAL_MS : POLL_INTERVAL_MS);
    } catch (err) {
      errorsRef.current++;
      const backoff = Math.min(
        POLL_INTERVAL_MS * Math.pow(2, errorsRef.current - 1),
        MAX_BACKOFF_MS
      );
      const msg = err instanceof Error ? err.message : String(err);
      setState((prev) => ({ ...prev, error: msg }));
      timerRef.current = setTimeout(poll, backoff);
    }
  }, []);

  const credentialsKey = JSON.stringify(credentials);

  useEffect(() => {
    clientRef.current = createClient(credentials);
    poll();

    const sub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        if (timerRef.current) clearTimeout(timerRef.current);
        poll();
      }
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      sub.remove();
    };
  }, [credentialsKey, poll]);

  return state;
}
