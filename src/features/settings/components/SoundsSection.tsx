import { useTranslation } from "react-i18next";
import { ALARM_SOUND_KINDS, type AlarmSoundKind, type Settings, type ThemeColors } from "../types";
import { ALARM_SOUND_KIND_INFO } from "../helpers/alarmSoundKinds";
import { Section } from "./Section";
import { NavRow } from "./NavRow";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onPickSound: (kind: AlarmSoundKind) => void;
}

export function SoundsSection({ settings, theme, onPickSound }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.sounds")} theme={theme}>
      {ALARM_SOUND_KINDS.map((kind) => (
        <NavRow
          key={kind}
          label={t(ALARM_SOUND_KIND_INFO[kind].labelKey)}
          value={t(`sounds.${settings.alarmSounds[kind]}`)}
          icon={ALARM_SOUND_KIND_INFO[kind].icon}
          theme={theme}
          onPress={() => onPickSound(kind)}
        />
      ))}
    </Section>
  );
}
