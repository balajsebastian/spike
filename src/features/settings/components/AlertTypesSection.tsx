import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import {
  ArrowDown,
  ArrowUp,
  ChevronsDown,
  ChevronsUp,
  ArrowDownToLine,
  ArrowUpToLine,
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

type ToggleKey =
  | "urgentLowEnabled"
  | "lowEnabled"
  | "highEnabled"
  | "urgentHighEnabled"
  | "predictedLowEnabled"
  | "predictedHighEnabled"
  | "fallingEnabled"
  | "risingEnabled";

/** `infoKey` explains the less obvious alerts (Low / High speak for themselves). */
const TOGGLE_ROWS: { key: ToggleKey; labelKey: string; infoKey?: string; icon: LucideIcon }[] = [
  { key: "urgentLowEnabled", labelKey: "settings.urgentLow", icon: ChevronsDown },
  { key: "lowEnabled", labelKey: "settings.low", icon: ArrowDown },
  { key: "highEnabled", labelKey: "settings.high", icon: ArrowUp },
  { key: "urgentHighEnabled", labelKey: "settings.urgentHigh", icon: ChevronsUp },
  { key: "predictedLowEnabled", labelKey: "settings.predictedLow", infoKey: "settings.info.predictedLow", icon: ArrowDownToLine },
  { key: "predictedHighEnabled", labelKey: "settings.predictedHigh", infoKey: "settings.info.predictedHigh", icon: ArrowUpToLine },
  { key: "fallingEnabled", labelKey: "settings.rapidFall", infoKey: "settings.info.rapidFall", icon: TrendingDown },
  { key: "risingEnabled", labelKey: "settings.rapidRise", infoKey: "settings.info.rapidRise", icon: TrendingUp },
];

interface Props {
  settings: Settings;
  theme: ThemeColors;
  urgentRepeatMinutes: number;
  predictionMinutes: number;
  onChange: (partial: Partial<Settings>) => void;
  onStepRepeat: (direction: StepDirection) => void;
  onStepNoData: (direction: StepDirection) => void;
}

export function AlertTypesSection({
  settings,
  theme,
  urgentRepeatMinutes,
  predictionMinutes,
  onChange,
  onStepRepeat,
  onStepNoData,
}: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.alertTypes")} theme={theme}>
      {TOGGLE_ROWS.map(({ key, labelKey, infoKey, icon }) => (
        <Row
          key={key}
          label={t(labelKey)}
          icon={icon}
          info={infoKey && t(infoKey, { count: predictionMinutes })}
          theme={theme}
        >
          <Switch value={settings[key]} onValueChange={(value) => onChange({ [key]: value })} />
        </Row>
      ))}
      <Row label={t("settings.noData")} icon={WifiOff} info={t("settings.info.noData")} theme={theme}>
        <Switch value={settings.noDataEnabled} onValueChange={(noDataEnabled) => onChange({ noDataEnabled })} />
      </Row>
      {settings.noDataEnabled && (
        <Row label={t("settings.noDataAfter")} icon={Timer} info={t("settings.info.noDataAfter")} theme={theme}>
          <Stepper
            displayValue={t("common.minutes", { count: settings.noDataMinutes })}
            onStep={onStepNoData}
            theme={theme}
          />
        </Row>
      )}
      <Row
        label={t("settings.repeatOther")}
        icon={Repeat}
        info={t("settings.info.repeatOther", { count: urgentRepeatMinutes })}
        theme={theme}
      >
        <Stepper
          displayValue={t("common.minutes", { count: settings.nonUrgentRepeatMinutes })}
          onStep={onStepRepeat}
          theme={theme}
        />
      </Row>
    </Section>
  );
}
