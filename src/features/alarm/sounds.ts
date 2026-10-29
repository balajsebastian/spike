import type { AlarmSound } from "@/features/settings/types";
import beepSound from "@assets/alarm-beep.wav";
import doubleBeepSound from "@assets/alarm-double-beep.wav";
import arcadeSound from "@assets/alarm-arcade.wav";
import sirenSound from "@assets/alarm-siren.wav";
import chimeSound from "@assets/alarm-chime.wav";
import signalSound from "@assets/alarm-signal.wav";

export const SOUND_SOURCES: Record<AlarmSound, number> = {
  beep: beepSound,
  "double-beep": doubleBeepSound,
  arcade: arcadeSound,
  siren: sirenSound,
  chime: chimeSound,
  signal: signalSound,
};
