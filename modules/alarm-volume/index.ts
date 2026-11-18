import { NativeModule, requireOptionalNativeModule } from "expo";

type AlarmVolumeEvents = {
  onVolumeChange(event: { volume: number }): void;
};

declare class AlarmVolumeModule extends NativeModule<AlarmVolumeEvents> {
  /** Media volume, 0–1, or null if it can't be read. */
  getVolume(): number | null;
  /** Android: sets the media volume (0–1) without showing the volume panel. iOS: not allowed, resolves false. */
  setVolume(value: number): Promise<boolean>;
}

/**
 * Local native module (modules/alarm-volume). Optional, so the app keeps working, without the volume
 * features, in a build that doesn't include it.
 */
export const AlarmVolume = requireOptionalNativeModule<AlarmVolumeModule>("AlarmVolume");
