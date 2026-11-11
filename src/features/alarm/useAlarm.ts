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
} from "./constants";
import { useSoundPlayers } from "./useSoundPlayers";

export type AlarmLevel = "urgent-low" | "low" | "urgent-high" | "high" | "falling" | "rising" | null;

function getAlarmLevel(reading: GlucoseReading | null, settings: Settings): AlarmLevel {
  if (!reading) return null;
  if (reading.valueMgdl < settings.urgentLowThreshold) return "urgent-low";
  if (reading.valueMgdl < settings.lowThreshold) return "low";
  if (reading.valueMgdl > settings.urgentHighThreshold) return "urgent-high";
  if (reading.valueMgdl > settings.highThreshold) return "high";
  if (reading.trend === "DoubleDown" || reading.trend === "SingleDown") return "falling";
  if (reading.trend === "DoubleUp" || reading.trend === "SingleUp") return "rising";
  return null;
}

export function isUrgentLevel(level: AlarmLevel): boolean {
  return level === "urgent-low" || level === "urgent-high";
}

function severity(level: AlarmLevel): number {
  if (!level) return 0;
  if (isUrgentLevel(level)) return 3;
  if (level === "low" || level === "high") return 2;
  return 1;
}

function isAlarmEnabled(level: AlarmLevel, settings: Settings): boolean {
  switch (level) {
    // An urgent reading is also past the regular threshold, so it still alarms if only that one is on.
    case "urgent-low": return settings.urgentLowEnabled || settings.lowEnabled;
    case "low": return settings.lowEnabled;
    case "urgent-high": return settings.urgentHighEnabled || settings.highEnabled;
    case "high": return settings.highEnabled;
    case "falling": return settings.fallingEnabled;
    case "rising": return settings.risingEnabled;
    default: return false;
  }
}

export function useAlarm(reading: GlucoseReading | null, settings: Settings) {
  const lastAlarmRef = useRef<{ level: AlarmLevel; time: number }>({ level: null, time: 0 });
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
  }, [settings.alarmSound, players]);

  useEffect(() => {
    if (!reading) return;
    if (reading.timestampMs === lastReadingTimestampRef.current) return;
    lastReadingTimestampRef.current = reading.timestampMs;

    const level = getAlarmLevel(reading, settings);
    if (!level || !isAlarmEnabled(level, settings)) return;
    if (snoozeUntil > Date.now()) return;

    const now = Date.now();
    const repeatMinutes = isUrgentLevel(level) ? URGENT_REPEAT_MINUTES : settings.nonUrgentRepeatMinutes;
    const last = lastAlarmRef.current;
    // Getting worse (trend -> threshold -> urgent) alarms immediately; otherwise wait for the repeat interval.
    const escalated = severity(level) > severity(last.level);
    if (!escalated && now - last.time < repeatMinutes * 60_000 - REPEAT_GRACE_MS) return;

    lastAlarmRef.current = { level, time: now };
    playAlarm();
  }, [reading, settings, playAlarm, snoozeUntil]);

  return {
    alarmLevel: getAlarmLevel(reading, settings),
    snooze,
    cancelSnooze,
    snoozeUntil,
  };
}
