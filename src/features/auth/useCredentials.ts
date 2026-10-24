import { useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import type { Credentials } from "./types";

const STORAGE_KEY = "cgm_credentials";

export function useCredentials() {
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(function loadCredentials() {
    SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object" && "source" in parsed) {
            setCredentials(parsed as Credentials);
          } else {
            SecureStore.deleteItemAsync(STORAGE_KEY);
          }
        } catch {
          SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      }
      setLoading(false);
    });
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
