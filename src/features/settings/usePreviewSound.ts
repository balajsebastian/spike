import { useSoundPlayers } from "@/features/alarm/useSoundPlayers";
import type { AlarmSound } from "./types";

export function usePreviewSound() {
  const players = useSoundPlayers();

  return async (sound: AlarmSound) => {
    const player = players[sound];
    await player.seekTo(0);
    player.play();
  };
}
