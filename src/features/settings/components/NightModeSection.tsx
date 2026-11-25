import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { BellRing, MoonStar, SunDim, Sunrise, Sunset } from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import { orderNightThresholds, type NightTimeKey, type StepDirection, type ThresholdKey } from "../helpers/steppers";
import { formatClock } from "../helpers/format";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";
import { NIGHT_THRESHOLD_ROWS, ThresholdRows } from "./ThresholdsSection";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onChange: (partial: Partial<Settings>) => void;
  onStepTime: (key: NightTimeKey, direction: StepDirection) => void;
  onStepBrightness: (direction: StepDirection) => void;
  onStepThreshold: (key: ThresholdKey, direction: StepDirection) => void;
}

/** The night hours, and what changes during them: the brightness and, if on, the alert thresholds. */
export function NightModeSection({ settings, theme, onChange, onStepTime, onStepBrightness, onStepThreshold }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.night")} theme={theme}>
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
          <Row
            label={t("settings.nightThresholds")}
            icon={BellRing}
            info={t("settings.info.nightThresholds")}
            theme={theme}
          >
            <Switch
              value={settings.nightThresholdsEnabled}
              // Urgent Low may have moved up while these were off; keep them above it.
              onValueChange={(nightThresholdsEnabled) =>
                onChange({ nightThresholdsEnabled, ...orderNightThresholds(settings) })
              }
            />
          </Row>
          {settings.nightThresholdsEnabled && (
            <ThresholdRows rows={NIGHT_THRESHOLD_ROWS} settings={settings} theme={theme} onStep={onStepThreshold} />
          )}
        </>
      )}
    </Section>
  );
}
