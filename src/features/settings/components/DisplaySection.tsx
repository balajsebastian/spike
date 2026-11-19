import { Switch } from "react-native";
import { useTranslation } from "react-i18next";
import { ChartSpline, Diff, History, Moon, Palette, Ruler } from "lucide-react-native";
import { TREND_WINDOW_HOURS, type Settings, type ThemeColors } from "../types";
import { Section } from "./Section";
import { Row } from "./Row";
import { Segmented } from "./Segmented";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  onChange: (partial: Partial<Settings>) => void;
}

export function DisplaySection({ settings, theme, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Section title={t("settings.sections.display")} theme={theme}>
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
      <Row label={t("settings.coloredValues")} icon={Palette} info={t("settings.info.coloredValues")} theme={theme}>
        <Switch value={settings.coloredValues} onValueChange={(coloredValues) => onChange({ coloredValues })} />
      </Row>
      <Row label={t("settings.delta")} icon={Diff} info={t("settings.info.delta")} theme={theme}>
        <Switch value={settings.showDelta} onValueChange={(showDelta) => onChange({ showDelta })} />
      </Row>
      <Row label={t("settings.trendLine")} icon={ChartSpline} info={t("settings.info.trendLine")} theme={theme}>
        <Switch value={settings.showTrendLine} onValueChange={(showTrendLine) => onChange({ showTrendLine })} />
      </Row>
      {settings.showTrendLine && (
        <Row label={t("settings.trendWindow")} icon={History} info={t("settings.info.trendWindow")} theme={theme}>
          <Segmented
            options={TREND_WINDOW_HOURS.map((hours) => ({ label: `${hours}h`, value: String(hours) }))}
            value={String(settings.trendWindowHours)}
            onChange={(value) => onChange({ trendWindowHours: Number(value) as Settings["trendWindowHours"] })}
            theme={theme}
          />
        </Row>
      )}
    </Section>
  );
}
