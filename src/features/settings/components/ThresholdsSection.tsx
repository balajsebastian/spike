import { useTranslation } from "react-i18next";
import { ArrowDown, ArrowUp, ChevronsDown, ChevronsUp, type LucideIcon } from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import type { StepDirection, ThresholdKey } from "../helpers/steppers";
import { formatThreshold } from "../helpers/format";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";

const THRESHOLD_ROWS: { key: ThresholdKey; labelKey: string; icon: LucideIcon }[] = [
  { key: "urgentLowThreshold", labelKey: "settings.urgentLow", icon: ChevronsDown },
  { key: "lowThreshold", labelKey: "settings.low", icon: ArrowDown },
  { key: "highThreshold", labelKey: "settings.high", icon: ArrowUp },
  { key: "urgentHighThreshold", labelKey: "settings.urgentHigh", icon: ChevronsUp },
];

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onStep: (key: ThresholdKey, direction: StepDirection) => void;
}

export function ThresholdsSection({ settings, theme, onStep }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.thresholds")} theme={theme}>
      {THRESHOLD_ROWS.map(({ key, labelKey, icon }) => (
        <Row key={key} label={t(labelKey)} icon={icon} theme={theme}>
          <Stepper
            displayValue={formatThreshold(settings[key], settings.unit)}
            onStep={(direction) => onStep(key, direction)}
            theme={theme}
          />
        </Row>
      ))}
    </Section>
  );
}
