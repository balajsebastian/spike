import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { Sun, SunMedium } from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import type { StepDirection } from "../helpers/steppers";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onChange: (partial: Partial<Settings>) => void;
  onStepDayBrightness: (direction: StepDirection) => void;
}

export function BrightnessSection({ settings, theme, onChange, onStepDayBrightness }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.brightness")} theme={theme}>
      <Row label={t("settings.dayBrightnessEnabled")} icon={Sun} info={t("settings.info.dayBrightness")} theme={theme}>
        <Switch
          value={settings.dayBrightnessEnabled}
          onValueChange={(dayBrightnessEnabled) => onChange({ dayBrightnessEnabled })}
        />
      </Row>
      {settings.dayBrightnessEnabled && (
        <Row label={t("settings.dayBrightness")} icon={SunMedium} theme={theme}>
          <Stepper displayValue={`${settings.dayBrightness}%`} onStep={onStepDayBrightness} theme={theme} />
        </Row>
      )}
    </Section>
  );
}
