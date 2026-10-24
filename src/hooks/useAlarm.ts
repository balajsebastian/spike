import { useEffect, useRef, useState, useCallback } from "react";
import { useAudioPlayer, setAudioModeAsync } from "expo-audio";
import * as Haptics from "expo-haptics";
import type { GlucoseReading } from "../dexcom/types";
import type { Settings } from "../settings/types";

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
  const player = useAudioPlayer(require("../../assets/beep.wav"));
  const [snoozeUntil, setSnoozeUntil] = useState(0);

  useEffect(() => {
    if (!audioConfigured.current) {
      setAudioModeAsync({ playsInSilentMode: true });
      audioConfigured.current = true;
    }
  }, []);

  const snooze = useCallback((minutes: number) => {
    setSnoozeUntil(Date.now() + minutes * 60_000);
  }, []);

  const cancelSnooze = useCallback(() => {
    setSnoozeUntil(0);
  }, []);

  const isSnoozed = snoozeUntil > Date.now();

  const playAlarm = useCallback(async () => {
    for (let round = 0; round < 2; round++) {
      for (let j = 0; j < 10; j++) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await new Promise((r) => setTimeout(r, 150));
      }
      player.seekTo(0);
      player.play();
      if (round < 1) {
        await new Promise((r) => setTimeout(r, 2500));
      }
    }
  }, [player]);

  const triggerAlarm = useCallback(async (level: AlarmLevel) => {
    if (!level) return;
    await playAlarm();
  }, [playAlarm]);

  useEffect(() => {
    if (!reading) return;
    if (reading.sensorTimestampMs === lastReadingTimestampRef.current) return;
    lastReadingTimestampRef.current = reading.sensorTimestampMs;

    const level = getAlarmLevel(reading, settings);
    if (!level || !isAlarmEnabled(level, settings)) return;

    // Skip alarm if snoozed
    if (snoozeUntil > Date.now()) return;

    const now = Date.now();
    const repeatMs = settings.alarmRepeatMinutes * 60_000;
    if (now - lastAlarmTimeRef.current < repeatMs) return;

    lastAlarmTimeRef.current = now;
    playAlarm();
  }, [reading, settings, playAlarm, snoozeUntil]);

  return {
    alarmLevel: getAlarmLevel(reading, settings),
    triggerAlarm,
    snooze,
    cancelSnooze,
    isSnoozed,
    snoozeUntil,
  };
}
