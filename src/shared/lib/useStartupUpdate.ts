import { useEffect, useState } from "react";
import { Image } from "react-native";
import * as Updates from "expo-updates";

// Long enough for a normal connection, short enough that a bad one never keeps the user out.
const STARTUP_UPDATE_TIMEOUT_MS = 4000;
// Same look as the native splash (app.json → expo-splash-screen) so the restart is invisible.
const SPLASH_BACKGROUND = "#000000";
const SPLASH_IMAGE_SIZE = 200;

/** Resolves true when the app is about to restart into the new update. */
async function applyUpdateIfAvailable(isTimedOut: () => boolean): Promise<boolean> {
  const check = await Updates.checkForUpdateAsync();
  if (!check.isAvailable && !check.isRollBackToEmbedded) return false;

  const result = await Updates.fetchUpdateAsync();
  if (!result.isNew && !result.isRollBackToEmbedded) return false;
  // Too late: the app is already on screen. The update still applies on the next cold start.
  if (isTimedOut()) return false;

  const image = Image.resolveAssetSource(require("../../../assets/splash-icon.png"));
  await Updates.reloadAsync({
    reloadScreenOptions: {
      backgroundColor: SPLASH_BACKGROUND,
      image: image && { url: image.uri, width: SPLASH_IMAGE_SIZE, height: SPLASH_IMAGE_SIZE },
    },
  });
  return true;
}

/**
 * Applies a new OTA update before the app starts, while the splash is still showing,
 * so fresh installs and returning users see the latest version on the first launch.
 * Runs only at startup: the app must never restart on its own while it is monitoring.
 */
export function useStartupUpdate(): boolean {
  const [ready, setReady] = useState(__DEV__ || !Updates.isEnabled);

  useEffect(() => {
    if (ready) return;

    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      setReady(true);
    }, STARTUP_UPDATE_TIMEOUT_MS);

    applyUpdateIfAvailable(() => timedOut)
      // Offline or server error: start with the version we have.
      .catch(() => false)
      .then((restarting) => {
        // Keep the splash up while restarting, so the old version never flashes on screen.
        if (restarting) return;
        clearTimeout(timer);
        setReady(true);
      });

    return () => clearTimeout(timer);
  }, [ready]);

  return ready;
}
