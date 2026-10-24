import { useAudioPlayer } from "expo-audio";
import { SOUND_SOURCES } from "@/features/alarm/sounds";
import type { AlarmSound } from "./types";

export function usePreviewSound() {
  const beepPlayer = useAudioPlayer(SOUND_SOURCES.beep);
  const chimePlayer = useAudioPlayer(SOUND_SOURCES.chime);
  const hornPlayer = useAudioPlayer(SOUND_SOURCES.horn);
  const alertPlayer = useAudioPlayer(SOUND_SOURCES.alert);

  const players: Record<AlarmSound, typeof beepPlayer> = {
    beep: beepPlayer,
    chime: chimePlayer,
    horn: hornPlayer,
    alert: alertPlayer,
  };

  return (sound: AlarmSound) => {
    const player = players[sound];
    player.seekTo(0);
    player.play();
  };
}
