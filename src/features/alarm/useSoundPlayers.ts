import { useMemo } from "react";
import { useAudioPlayer } from "expo-audio";
import type { AlarmSound } from "@/features/settings/types";
import { SOUND_SOURCES } from "./sounds";

export function useSoundPlayers() {
  const beepPlayer = useAudioPlayer(SOUND_SOURCES.beep);
  const doubleBeepPlayer = useAudioPlayer(SOUND_SOURCES["double-beep"]);
  const arcadePlayer = useAudioPlayer(SOUND_SOURCES.arcade);
  const sirenPlayer = useAudioPlayer(SOUND_SOURCES.siren);
  const chimePlayer = useAudioPlayer(SOUND_SOURCES.chime);
  const signalPlayer = useAudioPlayer(SOUND_SOURCES.signal);

  return useMemo<Record<AlarmSound, typeof beepPlayer>>(
    () => ({
      beep: beepPlayer,
      "double-beep": doubleBeepPlayer,
      arcade: arcadePlayer,
      siren: sirenPlayer,
      chime: chimePlayer,
      signal: signalPlayer,
    }),
    [beepPlayer, doubleBeepPlayer, arcadePlayer, sirenPlayer, chimePlayer, signalPlayer],
  );
}
