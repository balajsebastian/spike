import { useEffect, useRef, useState, useCallback } from "react";
import { setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { GlucoseReading } from "@/shared/types";
import type { Settings } from "@/features/settings/types";
import {
  ALARM_ROUNDS,
  HAPTIC_BURSTS,
  HAPTIC_DELAY_MS,
  ALARM_PAUSE_MS,
  URGENT_REPEAT_MINUTES,
  REPEAT_GRACE_MS,
} from "../constants";
import {
  type ActiveAlarmLevel,
  type LastAlarm,
  getAlarmLevel,
  isAlarmDue,
  isAlarmEnabled,
  soundKind,
} from "../helpers/alarmLevel";
import { useSoundPlayers } from "./useSoundPlayers";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useAlarm(reading: GlucoseReading | null, settings: Settings) {
  const lastAlarmRef = useRef<LastAlarm>({ level: null, time: 0 });
  const lastReadingTimestampRef = useRef(0);
  const audioConfigured = useRef(false);
  const [snoozeUntil, setSnoozeUntil] = useState(0);

  const players = useSoundPlayers();

  useEffect(() => {
    if (!audioConfigured.current) {
      setAudioModeAsync({ playsInSilentMode: true });
      audioConfigured.current = true;
    }
  }, []);

  const snooze = (minutes: number) => {
    setSnoozeUntil(Date.now() + minutes * 60_000);
  };

  const cancelSnooze = () => {
    setSnoozeUntil(0);
  };

  const playAlarm = useCallback(async (level: ActiveAlarmLevel) => {
    const player = players[settings.alarmSounds[soundKind(level)]];
    for (let round = 0; round < ALARM_ROUNDS; round++) {
      for (let j = 0; j < HAPTIC_BURSTS; j++) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await wait(HAPTIC_DELAY_MS);
      }
      player.seekTo(0);
      player.play();
      if (round < ALARM_ROUNDS - 1) await wait(ALARM_PAUSE_MS);
    }
  }, [settings.alarmSounds, players]);

  useEffect(() => {
    if (!reading) return;
    if (reading.timestampMs === lastReadingTimestampRef.current) return;
    lastReadingTimestampRef.current = reading.timestampMs;

    const level = getAlarmLevel(reading, settings);
    if (!level || !isAlarmEnabled(level, settings)) return;
    if (snoozeUntil > Date.now()) return;

    const now = Date.now();
    const due = isAlarmDue(
      level,
      lastAlarmRef.current,
      now,
      settings.nonUrgentRepeatMinutes,
      URGENT_REPEAT_MINUTES,
      REPEAT_GRACE_MS,
    );
    if (!due) return;

    lastAlarmRef.current = { level, time: now };
    playAlarm(level);
  }, [reading, settings, playAlarm, snoozeUntil]);

  return {
    alarmLevel: getAlarmLevel(reading, settings),
    snooze,
    cancelSnooze,
    snoozeUntil,
  };
}
