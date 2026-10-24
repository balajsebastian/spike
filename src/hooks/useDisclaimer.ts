import { useEffect, useState, useCallback } from "react";
import * as SecureStore from "expo-secure-store";

const KEY_DISCLAIMER = "disclaimer_accepted";

export function useDisclaimer() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const value = await SecureStore.getItemAsync(KEY_DISCLAIMER);
      setAccepted(value === "true");
      setLoading(false);
    })();
  }, []);

  const accept = useCallback(async () => {
    await SecureStore.setItemAsync(KEY_DISCLAIMER, "true");
    setAccepted(true);
  }, []);

  return { accepted, loading, accept };
}
