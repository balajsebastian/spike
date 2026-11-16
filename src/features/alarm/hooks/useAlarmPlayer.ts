import { useCallback, useEffect } from "react";
import { setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { AlarmSound, AlarmSoundKind } from "@/features/settings/types";
import { ALARM_ROUNDS, ALARM_PAUSE_MS, HAPTIC_BURSTS, HAPTIC_DELAY_MS } from "../constants";
import { useSoundPlayers } from "./useSoundPlayers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Plays the sound picked for an alarm kind, with haptic bursts, even in silent mode. */
export function useAlarmPlayer(alarmSounds: Record<AlarmSoundKind, AlarmSound>) {
  const players = useSoundPlayers();

  useEffect(function allowSoundInSilentMode() {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  return useCallback(
    async (kind: AlarmSoundKind) => {
      const player = players[alarmSounds[kind]];
      for (let round = 0; round < ALARM_ROUNDS; round++) {
        for (let burst = 0; burst < HAPTIC_BURSTS; burst++) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          await wait(HAPTIC_DELAY_MS);
        }
        player.seekTo(0);
        player.play();
        if (round < ALARM_ROUNDS - 1) await wait(ALARM_PAUSE_MS);
      }
    },
    [alarmSounds, players],
  );
}
