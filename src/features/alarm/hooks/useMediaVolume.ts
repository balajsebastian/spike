import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import { AlarmVolume } from "@modules/alarm-volume";

/** The media volume the alarm plays at (0–1), kept up to date; null until known or if it can't be read. */
export function useMediaVolume(): number | null {
  const [volume, setVolume] = useState<number | null>(null);

  useEffect(function watchVolume() {
    const volumeModule = AlarmVolume;
    if (!volumeModule) return;
    let cancelled = false;
    let volumeSub: { remove: () => void } | null = null;

    const read = () => {
      try {
        setVolume(volumeModule.getVolume());
      } catch {
        // Unknown volume: no warning, nothing else changes.
      }
    };

    (async () => {
      // On iOS, following volume changes activates the audio session; the playback category has to be set
      // first so that doesn't stop other apps' audio. Same mode as the alarm player, so setting it twice is fine.
      await setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
      if (cancelled) return;
      read();
      volumeSub = volumeModule.addListener("onVolumeChange", (event) => setVolume(event.volume));
    })();

    // Changed in another app or Control Center while Spike was in the background.
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") read();
    });

    return () => {
      cancelled = true;
      volumeSub?.remove();
      appStateSub.remove();
    };
  }, []);

  return volume;
}
