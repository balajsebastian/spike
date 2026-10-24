import { useEffect, useRef, useState, useCallback } from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { GlucoseReading } from "@/shared/types";
import type { Settings, AlarmSound } from "@/features/settings/types";
import {
  ALARM_ROUNDS,
  HAPTIC_BURSTS,
  HAPTIC_DELAY_MS,
  ALARM_PAUSE_MS,
} from "./constants";
import { SOUND_SOURCES } from "./sounds";

export type AlarmLevel = "urgent-low" | "low" | "high" | "falling" | "rising" | null;

function getAlarmLevel(reading: GlucoseReading | null, settings: Settings): AlarmLevel {
  if (!reading) return null;
  if (reading.valueMgdl < settings.urgentLowThreshold) return "urgent-low";
  if (reading.valueMgdl < settings.lowThreshold) return "low";
  if (reading.valueMgdl > settings.highThreshold) return "high";
  if (reading.trend === "DoubleDown" || reading.trend === "SingleDown") return "falling";
  if (reading.trend === "DoubleUp" || reading.trend === "SingleUp") return "rising";
  return null;
}

function isAlarmEnabled(level: AlarmLevel, settings: Settings): boolean {
  switch (level) {
    case "urgent-low": return settings.urgentLowEnabled;
    case "low": return settings.lowEnabled;
    case "high": return settings.highEnabled;
    case "falling": return settings.fallingEnabled;
    case "rising": return settings.risingEnabled;
    default: return false;
  }
}

export function useAlarm(reading: GlucoseReading | null, settings: Settings) {
  const lastAlarmTimeRef = useRef(0);
  const lastReadingTimestampRef = useRef(0);
  const audioConfigured = useRef(false);
  const [snoozeUntil, setSnoozeUntil] = useState(0);

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

  const isSnoozed = snoozeUntil > Date.now();

  const playAlarm = useCallback(async () => {
    const player = players[settings.alarmSound];
    for (let round = 0; round < ALARM_ROUNDS; round++) {
      for (let j = 0; j < HAPTIC_BURSTS; j++) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await new Promise((r) => setTimeout(r, HAPTIC_DELAY_MS));
      }
      player.seekTo(0);
      player.play();
      if (round < ALARM_ROUNDS - 1) {
        await new Promise((r) => setTimeout(r, ALARM_PAUSE_MS));
      }
    }
  }, [settings.alarmSound, beepPlayer, chimePlayer, hornPlayer, alertPlayer]);

  useEffect(() => {
    if (!reading) return;
    if (reading.timestampMs === lastReadingTimestampRef.current) return;
    lastReadingTimestampRef.current = reading.timestampMs;

    const level = getAlarmLevel(reading, settings);
    if (!level || !isAlarmEnabled(level, settings)) return;
    if (snoozeUntil > Date.now()) return;

    const now = Date.now();
    const repeatMs = settings.alarmRepeatMinutes * 60_000;
    if (now - lastAlarmTimeRef.current < repeatMs) return;

    lastAlarmTimeRef.current = now;
    playAlarm();
  }, [reading, settings, playAlarm, snoozeUntil]);

  return {
    alarmLevel: getAlarmLevel(reading, settings),
    snooze,
    cancelSnooze,
    isSnoozed,
    snoozeUntil,
  };
}
