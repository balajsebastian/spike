import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { MoonStar, SunDim, Sunrise, Sunset } from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import type { NightTimeKey, StepDirection } from "../helpers/steppers";
import { formatClock } from "../helpers/format";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onChange: (partial: Partial<Settings>) => void;
  onStepTime: (key: NightTimeKey, direction: StepDirection) => void;
  onStepBrightness: (direction: StepDirection) => void;
}

export function NightModeSection({ settings, theme, onChange, onStepTime, onStepBrightness }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.nightMode")} theme={theme}>
      <Row label={t("settings.nightMode")} icon={MoonStar} info={t("settings.info.nightMode")} theme={theme}>
        <Switch
          value={settings.nightModeEnabled}
          onValueChange={(nightModeEnabled) => onChange({ nightModeEnabled })}
        />
      </Row>
      {settings.nightModeEnabled && (
        <>
          <Row label={t("settings.nightStart")} icon={Sunset} theme={theme}>
            <Stepper
              displayValue={formatClock(settings.nightStartMinutes)}
              onStep={(direction) => onStepTime("nightStartMinutes", direction)}
              theme={theme}
            />
          </Row>
          <Row label={t("settings.nightEnd")} icon={Sunrise} theme={theme}>
            <Stepper
              displayValue={formatClock(settings.nightEndMinutes)}
              onStep={(direction) => onStepTime("nightEndMinutes", direction)}
              theme={theme}
            />
          </Row>
          <Row
            label={t("settings.nightBrightness")}
            icon={SunDim}
            info={t("settings.info.nightBrightness")}
            theme={theme}
          >
            <Stepper displayValue={`${settings.nightBrightness}%`} onStep={onStepBrightness} theme={theme} />
          </Row>
        </>
      )}
    </Section>
  );
}
