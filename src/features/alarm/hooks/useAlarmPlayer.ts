import { useCallback, useEffect, useRef } from "react";
import { Platform } from "react-native";
import { setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import { VolumeManager } from "react-native-volume-manager";
import type { AlarmSound, AlarmSoundKind } from "@/features/settings/types";
import { ALARM_ROUNDS, ALARM_PAUSE_MS, HAPTIC_BURSTS, HAPTIC_DELAY_MS } from "../constants";
import { useSoundPlayers } from "./useSoundPlayers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// Used when the sound's length isn't known yet.
const FALLBACK_SOUND_MS = 3000;

/**
 * Plays the sound picked for an alarm kind, with haptic bursts, even in silent mode.
 * On Android the media volume is turned all the way up while it plays and put back after;
 * iOS doesn't allow that, so the monitor warns about a low volume instead.
 */
export function useAlarmPlayer(alarmSounds: Record<AlarmSoundKind, AlarmSound>) {
  const players = useSoundPlayers();
  // The user's volume while it's raised for an alarm, so overlapping alarms don't save the raised one.
  const savedVolumeRef = useRef<number | null>(null);

  useEffect(function allowSoundInSilentMode() {
    setAudioModeAsync({ playsInSilentMode: true });
  }, []);

  return useCallback(
    async (kind: AlarmSoundKind) => {
      const player = players[alarmSounds[kind]];
      const raise = Platform.OS === "android";

      if (raise && savedVolumeRef.current === null) {
        try {
          savedVolumeRef.current = (await VolumeManager.getVolume()).volume;
          await VolumeManager.setVolume(1, { type: "music", showUI: false });
        } catch {
          savedVolumeRef.current = null;
        }
      }

      for (let round = 0; round < ALARM_ROUNDS; round++) {
        for (let burst = 0; burst < HAPTIC_BURSTS; burst++) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          await wait(HAPTIC_DELAY_MS);
        }
        player.seekTo(0);
        player.play();
        if (round < ALARM_ROUNDS - 1) await wait(ALARM_PAUSE_MS);
      }

      if (raise && savedVolumeRef.current !== null) {
        // Let the last round finish before turning it back down.
        await wait(player.duration > 0 ? player.duration * 1000 : FALLBACK_SOUND_MS);
        const saved = savedVolumeRef.current;
        savedVolumeRef.current = null;
        VolumeManager.setVolume(saved, { type: "music", showUI: false }).catch(() => {});
      }
    },
    [alarmSounds, players],
  );
}
