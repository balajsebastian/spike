import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { BellOff, Timer } from "lucide-react-native";
import { COLORS } from "@/shared/colors";
import type { Settings, ThemeColors } from "../types";
import type { StepDirection } from "../helpers/steppers";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  /** Minutes above which a long snooze gets a warning, or null to hide it. */
  snoozeWarningAbove: number | null;
  onChange: (partial: Partial<Settings>) => void;
  onStepSnooze: (direction: StepDirection) => void;
}

export function AlarmSection({ settings, theme, snoozeWarningAbove, onChange, onStepSnooze }: Props) {
  const { t } = useTranslation();

  return (
    <Section
      title={t("settings.sections.alarm")}
      footer={snoozeWarningAbove !== null && t("settings.snoozeWarning", { count: snoozeWarningAbove })}
      footerColor={COLORS.warning}
      theme={theme}
    >
      <Row label={t("settings.snooze")} icon={BellOff} info={t("settings.info.snooze")} theme={theme}>
        <Switch value={settings.snoozeEnabled} onValueChange={(snoozeEnabled) => onChange({ snoozeEnabled })} />
      </Row>
      {settings.snoozeEnabled && (
        <Row
          label={t("settings.snoozeDuration")}
          icon={Timer}
          info={t("settings.info.snoozeDuration")}
          theme={theme}
        >
          <Stepper
            displayValue={t("common.minutes", { count: settings.snoozeMinutes })}
            onStep={onStepSnooze}
            theme={theme}
          />
        </Row>
      )}
    </Section>
  );
}
