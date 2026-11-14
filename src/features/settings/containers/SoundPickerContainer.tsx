import { router, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsContext } from "../SettingsContext";
import { isAlarmSoundKind } from "../types";
import { ALARM_SOUND_KIND_INFO } from "../helpers/alarmSoundKinds";
import { usePreviewSound } from "../hooks/usePreviewSound";
import { SoundPickerView } from "../components/SoundPickerView";

/** Picks the sound for one alarm kind (from the `kind` route param) and plays it on tap. */
export function SoundPickerContainer() {
  const { t } = useTranslation();
  const { settings, theme, update } = useSettingsContext();
  const previewSound = usePreviewSound();
  const params = useLocalSearchParams<{ kind?: string }>();
  const kind = isAlarmSoundKind(params.kind) ? params.kind : "urgentLow";

  return (
    <SoundPickerView
      title={t(ALARM_SOUND_KIND_INFO[kind].labelKey)}
      selected={settings.alarmSounds[kind]}
      theme={theme}
      onSelect={(sound) => {
        update({ alarmSounds: { ...settings.alarmSounds, [kind]: sound } });
        previewSound(sound);
      }}
      onDone={() => router.back()}
    />
  );
}
