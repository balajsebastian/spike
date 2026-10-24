import { useMemo } from "react";
import { useAudioPlayer } from "expo-audio";
import type { AlarmSound } from "@/features/settings/types";
import { SOUND_SOURCES } from "./sounds";

export function useSoundPlayers() {
  const beepPlayer = useAudioPlayer(SOUND_SOURCES.beep);
  const chimePlayer = useAudioPlayer(SOUND_SOURCES.chime);
  const hornPlayer = useAudioPlayer(SOUND_SOURCES.horn);
  const alertPlayer = useAudioPlayer(SOUND_SOURCES.alert);

  return useMemo<Record<AlarmSound, typeof beepPlayer>>(
    () => ({ beep: beepPlayer, chime: chimePlayer, horn: hornPlayer, alert: alertPlayer }),
    [beepPlayer, chimePlayer, hornPlayer, alertPlayer],
  );
}
