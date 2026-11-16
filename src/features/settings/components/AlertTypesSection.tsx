import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  Repeat,
  Timer,
  TrendingDown,
  TrendingUp,
  WifiOff,
  type LucideIcon,
} from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import type { StepDirection } from "../helpers/steppers";
import { Section } from "./Section";
import { Row } from "./Row";
import { Stepper } from "./Stepper";

type ToggleKey = "urgentLowEnabled" | "lowEnabled" | "highEnabled" | "urgentHighEnabled" | "fallingEnabled" | "risingEnabled";

const TOGGLE_ROWS: { key: ToggleKey; labelKey: string; icon: LucideIcon }[] = [
  { key: "urgentLowEnabled", labelKey: "settings.urgentLow", icon: ChevronsDown },
  { key: "lowEnabled", labelKey: "settings.low", icon: ArrowDown },
  { key: "highEnabled", labelKey: "settings.high", icon: ArrowUp },
  { key: "urgentHighEnabled", labelKey: "settings.urgentHigh", icon: ChevronsUp },
  { key: "fallingEnabled", labelKey: "settings.rapidFall", icon: TrendingDown },
  { key: "risingEnabled", labelKey: "settings.rapidRise", icon: TrendingUp },
];

interface Props {
  settings: Settings;
  theme: ThemeColors;
  urgentRepeatMinutes: number;
  onChange: (partial: Partial<Settings>) => void;
  onStepRepeat: (direction: StepDirection) => void;
  onStepNoData: (direction: StepDirection) => void;
}

export function AlertTypesSection({ settings, theme, urgentRepeatMinutes, onChange, onStepRepeat, onStepNoData }: Props) {
  const { t } = useTranslation();

  return (
    <Section
      title={t("settings.sections.alertTypes")}
      footer={`${t("settings.repeatFooter", { count: urgentRepeatMinutes })} ${t("settings.noDataFooter")}`}
      theme={theme}
    >
      {TOGGLE_ROWS.map(({ key, labelKey, icon }) => (
        <Row key={key} label={t(labelKey)} icon={icon} theme={theme}>
          <Switch value={settings[key]} onValueChange={(value) => onChange({ [key]: value })} />
        </Row>
      ))}
      <Row label={t("settings.noData")} icon={WifiOff} theme={theme}>
        <Switch value={settings.noDataEnabled} onValueChange={(noDataEnabled) => onChange({ noDataEnabled })} />
      </Row>
      {settings.noDataEnabled && (
        <Row label={t("settings.noDataAfter")} icon={Timer} theme={theme}>
          <Stepper
            displayValue={t("common.minutes", { count: settings.noDataMinutes })}
            onStep={onStepNoData}
            theme={theme}
          />
        </Row>
      )}
      <Row label={t("settings.repeatOther")} icon={Repeat} theme={theme}>
        <Stepper
          displayValue={t("common.minutes", { count: settings.nonUrgentRepeatMinutes })}
          onStep={onStepRepeat}
          theme={theme}
        />
      </Row>
    </Section>
  );
}
