import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import type { AlarmSoundKind, Settings, ThemeColors } from "../types";
import type { StepDirection, ThresholdKey } from "../helpers/steppers";
import { DisplaySection } from "./DisplaySection";
import { ThresholdsSection } from "./ThresholdsSection";
import { AlertTypesSection } from "./AlertTypesSection";
import { SoundsSection } from "./SoundsSection";
import { AlarmSection } from "./AlarmSection";

interface Props {
  settings: Settings;
  theme: ThemeColors;
  insets: EdgeInsets;
  appVersion: string;
  trendHours: number;
  urgentRepeatMinutes: number;
  snoozeWarningAbove: number | null;
  onChange: (partial: Partial<Settings>) => void;
  onStepThreshold: (key: ThresholdKey, direction: StepDirection) => void;
  onStepRepeat: (direction: StepDirection) => void;
  onStepSnooze: (direction: StepDirection) => void;
  onPickSound: (kind: AlarmSoundKind) => void;
}

export function SettingsView({
  settings,
  theme,
  insets,
  appVersion,
  trendHours,
  urgentRepeatMinutes,
  snoozeWarningAbove,
  onChange,
  onStepThreshold,
  onStepRepeat,
  onStepSnooze,
  onPickSound,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* On iOS the native tab bar floats over the content, so the system insets the scroll view for it. */}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "ios" ? 8 : insets.top + 8,
            paddingLeft: insets.left,
            paddingRight: insets.right,
          },
        ]}
      >
        <Text style={[styles.title, { color: theme.text }]}>{t("tabs.settings")}</Text>

        <DisplaySection settings={settings} theme={theme} trendHours={trendHours} onChange={onChange} />
        <ThresholdsSection settings={settings} theme={theme} onStep={onStepThreshold} />
        <AlertTypesSection
          settings={settings}
          theme={theme}
          urgentRepeatMinutes={urgentRepeatMinutes}
          onChange={onChange}
          onStepRepeat={onStepRepeat}
        />
        <SoundsSection settings={settings} theme={theme} onPickSound={onPickSound} />
        <AlarmSection
          settings={settings}
          theme={theme}
          snoozeWarningAbove={snoozeWarningAbove}
          onChange={onChange}
          onStepSnooze={onStepSnooze}
        />

        <Text style={[styles.versionFooter, { color: theme.textTertiary }]}>Spike {appVersion}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    // Keep rows readable on iPad instead of stretching them across the whole screen.
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  versionFooter: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 28,
  },
});
