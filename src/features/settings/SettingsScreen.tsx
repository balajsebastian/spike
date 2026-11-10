import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/shared/colors";
import { OptionGroup } from "@/shared/OptionGroup";
import { useSettingsContext } from "./SettingsContext";
import { usePreviewSound } from "./usePreviewSound";
import { SectionHeader, Row, Segmented, Stepper } from "./components";
import { formatGlucose, ALARM_SOUNDS } from "./types";
import {
  THRESHOLD_MIN,
  THRESHOLD_MAX,
  THRESHOLD_STEP,
  ALARM_REPEAT_MIN,
  ALARM_REPEAT_MAX,
  SNOOZE_MIN,
  SNOOZE_MAX,
  SNOOZE_WARNING_ABOVE,
} from "./constants";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsScreen() {
  const { settings, theme, update } = useSettingsContext();
  const { t } = useTranslation();
  const alarmSoundOptions = ALARM_SOUNDS.map((s) => ({ ...s, label: t(`sounds.${s.value}`) }));
  const previewSound = usePreviewSound();
  const insets = useSafeAreaInsets();
  const unit = settings.unit;
  const unitLabel = unit === "mmol" ? "mmol/L" : "mg/dL";

  function thresholdDisplay(mgdl: number): string {
    return `${formatGlucose(mgdl, unit)} ${unitLabel}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top, paddingBottom: insets.bottom + 40, paddingLeft: insets.left, paddingRight: insets.right }]}>
        <SectionHeader title={t("settings.sections.display")} theme={theme} />
        <Row label={t("settings.theme")} theme={theme}>
          <Segmented
            options={[
              { label: t("settings.themeDark"), value: "dark" as const },
              { label: t("settings.themeLight"), value: "light" as const },
            ]}
            value={settings.theme}
            onChange={(v) => update({ theme: v })}
            theme={theme}
          />
        </Row>
        <Row label={t("settings.unit")} theme={theme}>
          <Segmented
            options={[
              { label: "mg/dL", value: "mgdl" as const },
              { label: "mmol/L", value: "mmol" as const },
            ]}
            value={settings.unit}
            onChange={(v) => update({ unit: v })}
            theme={theme}
          />
        </Row>
        <Row label={t("settings.keepScreenOn")} theme={theme}>
          <Switch
            value={settings.keepScreenOn}
            onValueChange={(v) => update({ keepScreenOn: v })}
          />
        </Row>
        {!settings.keepScreenOn && (
          <Text style={styles.warning}>
            {t("settings.keepScreenOnWarning")}
          </Text>
        )}

        <SectionHeader title={t("settings.sections.thresholds")} theme={theme} />
        <Row label={t("settings.urgentLow")} theme={theme}>
          <Stepper
            displayValue={thresholdDisplay(settings.urgentLowThreshold)}
            onDecrement={() =>
              update({
                urgentLowThreshold: Math.max(THRESHOLD_MIN, settings.urgentLowThreshold - THRESHOLD_STEP),
              })
            }
            onIncrement={() =>
              update({
                urgentLowThreshold: Math.min(
                  settings.lowThreshold - THRESHOLD_STEP,
                  settings.urgentLowThreshold + THRESHOLD_STEP,
                ),
              })
            }
            theme={theme}
          />
        </Row>
        <Row label={t("settings.low")} theme={theme}>
          <Stepper
            displayValue={thresholdDisplay(settings.lowThreshold)}
            onDecrement={() =>
              update({
                lowThreshold: Math.max(
                  settings.urgentLowThreshold + THRESHOLD_STEP,
                  settings.lowThreshold - THRESHOLD_STEP,
                ),
              })
            }
            onIncrement={() =>
              update({
                lowThreshold: Math.min(
                  settings.highThreshold - THRESHOLD_STEP,
                  settings.lowThreshold + THRESHOLD_STEP,
                ),
              })
            }
            theme={theme}
          />
        </Row>
        <Row label={t("settings.high")} theme={theme}>
          <Stepper
            displayValue={thresholdDisplay(settings.highThreshold)}
            onDecrement={() =>
              update({
                highThreshold: Math.max(
                  settings.lowThreshold + THRESHOLD_STEP,
                  settings.highThreshold - THRESHOLD_STEP,
                ),
              })
            }
            onIncrement={() =>
              update({ highThreshold: Math.min(THRESHOLD_MAX, settings.highThreshold + THRESHOLD_STEP) })
            }
            theme={theme}
          />
        </Row>

        <SectionHeader title={t("settings.sections.alertTypes")} theme={theme} />
        <Row label={t("settings.urgentLow")} theme={theme}>
          <Switch
            value={settings.urgentLowEnabled}
            onValueChange={(v) => update({ urgentLowEnabled: v })}
          />
        </Row>
        <Row label={t("settings.low")} theme={theme}>
          <Switch
            value={settings.lowEnabled}
            onValueChange={(v) => update({ lowEnabled: v })}
          />
        </Row>
        <Row label={t("settings.high")} theme={theme}>
          <Switch
            value={settings.highEnabled}
            onValueChange={(v) => update({ highEnabled: v })}
          />
        </Row>
        <Row label={t("settings.rapidFall")} theme={theme}>
          <Switch
            value={settings.fallingEnabled}
            onValueChange={(v) => update({ fallingEnabled: v })}
          />
        </Row>
        <Row label={t("settings.rapidRise")} theme={theme}>
          <Switch
            value={settings.risingEnabled}
            onValueChange={(v) => update({ risingEnabled: v })}
          />
        </Row>

        <SectionHeader title={t("settings.sections.alarm")} theme={theme} />
        <Row label={t("settings.sound")} theme={theme} vertical>
          <OptionGroup
            options={alarmSoundOptions}
            value={settings.alarmSound}
            onChange={(v) => {
              update({ alarmSound: v });
              previewSound(v);
            }}
            theme={theme}
            expand={false}
            containerStyle={styles.soundContainer}
            buttonStyle={styles.soundButton}
            labelStyle={styles.soundLabel}
          />
        </Row>
        <Row label={t("settings.repeatEvery")} theme={theme}>
          <Stepper
            displayValue={t("common.minutes", { count: settings.alarmRepeatMinutes })}
            onDecrement={() =>
              update({
                alarmRepeatMinutes: Math.max(ALARM_REPEAT_MIN, settings.alarmRepeatMinutes - 1),
              })
            }
            onIncrement={() =>
              update({
                alarmRepeatMinutes: Math.min(ALARM_REPEAT_MAX, settings.alarmRepeatMinutes + 1),
              })
            }
            theme={theme}
          />
        </Row>
        <Row label={t("settings.snooze")} theme={theme}>
          <Switch
            value={settings.snoozeEnabled}
            onValueChange={(v) => update({ snoozeEnabled: v })}
          />
        </Row>
        {settings.snoozeEnabled && (
          <>
            <Row label={t("settings.snoozeDuration")} theme={theme}>
              <Stepper
                displayValue={t("common.minutes", { count: settings.snoozeMinutes })}
                onDecrement={() =>
                  update({
                    snoozeMinutes: Math.max(SNOOZE_MIN, settings.snoozeMinutes - 1),
                  })
                }
                onIncrement={() =>
                  update({
                    snoozeMinutes: Math.min(SNOOZE_MAX, settings.snoozeMinutes + 1),
                  })
                }
                theme={theme}
              />
            </Row>
            {settings.snoozeMinutes > SNOOZE_WARNING_ABOVE && (
              <Text style={styles.warning}>
                {t("settings.snoozeWarning", { count: SNOOZE_WARNING_ABOVE })}
              </Text>
            )}
          </>
        )}

        <SectionHeader title={t("settings.sections.about")} theme={theme} />
        <Row label={t("settings.version")} theme={theme}>
          <Text style={{ color: theme.textSecondary }}>{APP_VERSION}</Text>
        </Row>
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
  },
  soundContainer: {
    flexWrap: "wrap",
    gap: 8,
  },
  soundButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soundLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  warning: {
    fontSize: 13,
    color: COLORS.warning,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
});
