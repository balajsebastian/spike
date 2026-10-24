import type { AlarmSound } from "@/features/settings/types";
import beepSound from "@assets/alarm-beep.wav";
import chimeSound from "@assets/alarm-chime.wav";
import hornSound from "@assets/alarm-horn.wav";
import alertSound from "@assets/alarm-alert.wav";

export const SOUND_SOURCES: Record<AlarmSound, number> = {
  beep: beepSound,
  chime: chimeSound,
  horn: hornSound,
  alert: alertSound,
};
