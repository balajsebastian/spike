import { useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "cgm_credentials";

export type CGMSource = "dexcom" | "libre" | "nightscout";

export type Credentials =
  | { source: "dexcom"; username: string; password: string; region: "eu" | "us" }
  | { source: "libre"; email: string; password: string }
  | { source: "nightscout"; url: string; token?: string };

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        try {
          setCredentials(JSON.parse(raw));
        } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const save = useCallback(async (creds: Credentials) => {
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(creds));
    setCredentials(creds);
  }, []);

  const clear = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setCredentials(null);
  }, []);

  return { credentials, loading, save, clear };
}
