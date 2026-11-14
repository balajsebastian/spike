import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { ChartSpline, Moon, Ruler } from "lucide-react-native";
import type { Settings, ThemeColors } from "../types";
import { Section } from "./Section";
import { Row } from "./Row";
import { Segmented } from "./Segmented";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  trendHours: number;
  onChange: (partial: Partial<Settings>) => void;
}

export function DisplaySection({ settings, theme, trendHours, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Section
      title={t("settings.sections.display")}
      footer={t("settings.trendLineFooter", { count: trendHours })}
      theme={theme}
    >
      <Row label={t("settings.theme")} icon={Moon} theme={theme}>
        <Segmented
          options={[
            { label: t("settings.themeDark"), value: "dark" as const },
            { label: t("settings.themeLight"), value: "light" as const },
          ]}
          value={settings.theme}
          onChange={(mode) => onChange({ theme: mode })}
          theme={theme}
        />
      </Row>
      <Row label={t("settings.unit")} icon={Ruler} theme={theme}>
        <Segmented
          options={[
            { label: "mg/dL", value: "mgdl" as const },
            { label: "mmol/L", value: "mmol" as const },
          ]}
          value={settings.unit}
          onChange={(unit) => onChange({ unit })}
          theme={theme}
        />
      </Row>
      <Row label={t("settings.trendLine")} icon={ChartSpline} theme={theme}>
        <Switch value={settings.showTrendLine} onValueChange={(showTrendLine) => onChange({ showTrendLine })} />
      </Row>
    </Section>
  );
}
