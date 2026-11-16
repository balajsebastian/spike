import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { VolumeManager } from "react-native-volume-manager";

/** The media volume the alarm plays at (0–1), kept up to date; null until known or if it can't be read. */
export function useMediaVolume(): number | null {
  const [volume, setVolume] = useState<number | null>(null);

  useEffect(function watchVolume() {
    const read = () =>
      VolumeManager.getVolume()
        .then((result) => setVolume(result.volume))
        .catch(() => {});
    read();

    const volumeSub = VolumeManager.addVolumeListener((result) => {
      // Android reports every stream; the alarm uses the media ("music") one.
      if (!result.type || result.type === "music") setVolume(result.volume);
    });
    // Changed in another app or Control Center while Spike was in the background.
    const appStateSub = AppState.addEventListener("change", (state) => {
      if (state === "active") read();
    });

    return () => {
      volumeSub.remove();
      appStateSub.remove();
    };
  }, []);

  return volume;
}
