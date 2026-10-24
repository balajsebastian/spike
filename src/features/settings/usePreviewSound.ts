import { useSoundPlayers } from "@/features/alarm/useSoundPlayers";
import type { AlarmSound } from "./types";

export function usePreviewSound() {
  const players = useSoundPlayers();

  return (sound: AlarmSound) => {
    const player = players[sound];
    player.seekTo(0);
    player.play();
  };
}
