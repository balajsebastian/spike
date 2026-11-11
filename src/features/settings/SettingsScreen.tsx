import { Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/shared/colors";
import { OptionGroup } from "@/shared/OptionGroup";
import { useSettingsContext } from "./SettingsContext";
import { usePreviewSound } from "./usePreviewSound";
import { URGENT_REPEAT_MINUTES } from "@/features/alarm/constants";
import {
  ArrowDown,
  ArrowUp,
  BellOff,
  ChevronsDown,
  ChevronsUp,
  Moon,
  Repeat,
  Ruler,
  Timer,
  TrendingDown,
  TrendingUp,
  Volume2,
} from "lucide-react-native";
import { Section, Row, Segmented, Stepper } from "./components";
import { formatGlucose, ALARM_SOUNDS } from "./types";
import {
  THRESHOLD_MIN,
  THRESHOLD_MAX,
  THRESHOLD_STEP,
  NON_URGENT_REPEAT_MIN,
  NON_URGENT_REPEAT_MAX,
  NON_URGENT_REPEAT_STEP,
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

        <Section title={t("settings.sections.display")} theme={theme}>
          <Row label={t("settings.theme")} icon={Moon} theme={theme}>
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
          <Row label={t("settings.unit")} icon={Ruler} theme={theme}>
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
        </Section>

        <Section title={t("settings.sections.thresholds")} theme={theme}>
          <Row label={t("settings.urgentLow")} icon={ChevronsDown} theme={theme}>
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
          <Row label={t("settings.low")} icon={ArrowDown} theme={theme}>
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
          <Row label={t("settings.high")} icon={ArrowUp} theme={theme}>
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
                update({
                  highThreshold: Math.min(
                    settings.urgentHighThreshold - THRESHOLD_STEP,
                    settings.highThreshold + THRESHOLD_STEP,
                  ),
                })
              }
              theme={theme}
            />
          </Row>
          <Row label={t("settings.urgentHigh")} icon={ChevronsUp} theme={theme}>
            <Stepper
              displayValue={thresholdDisplay(settings.urgentHighThreshold)}
              onDecrement={() =>
                update({
                  urgentHighThreshold: Math.max(
                    settings.highThreshold + THRESHOLD_STEP,
                    settings.urgentHighThreshold - THRESHOLD_STEP,
                  ),
                })
              }
              onIncrement={() =>
                update({
                  urgentHighThreshold: Math.min(THRESHOLD_MAX, settings.urgentHighThreshold + THRESHOLD_STEP),
                })
              }
              theme={theme}
            />
          </Row>
        </Section>

        <Section
          title={t("settings.sections.alertTypes")}
          footer={t("settings.repeatFooter", { count: URGENT_REPEAT_MINUTES })}
          theme={theme}
        >
          <Row label={t("settings.urgentLow")} icon={ChevronsDown} theme={theme}>
            <Switch value={settings.urgentLowEnabled} onValueChange={(v) => update({ urgentLowEnabled: v })} />
          </Row>
          <Row label={t("settings.low")} icon={ArrowDown} theme={theme}>
            <Switch value={settings.lowEnabled} onValueChange={(v) => update({ lowEnabled: v })} />
          </Row>
          <Row label={t("settings.high")} icon={ArrowUp} theme={theme}>
            <Switch value={settings.highEnabled} onValueChange={(v) => update({ highEnabled: v })} />
          </Row>
          <Row label={t("settings.urgentHigh")} icon={ChevronsUp} theme={theme}>
            <Switch value={settings.urgentHighEnabled} onValueChange={(v) => update({ urgentHighEnabled: v })} />
          </Row>
          <Row label={t("settings.rapidFall")} icon={TrendingDown} theme={theme}>
            <Switch value={settings.fallingEnabled} onValueChange={(v) => update({ fallingEnabled: v })} />
          </Row>
          <Row label={t("settings.rapidRise")} icon={TrendingUp} theme={theme}>
            <Switch value={settings.risingEnabled} onValueChange={(v) => update({ risingEnabled: v })} />
          </Row>
          <Row label={t("settings.repeatOther")} icon={Repeat} theme={theme}>
            <Stepper
              displayValue={t("common.minutes", { count: settings.nonUrgentRepeatMinutes })}
              onDecrement={() =>
                update({
                  nonUrgentRepeatMinutes: Math.max(
                    NON_URGENT_REPEAT_MIN,
                    settings.nonUrgentRepeatMinutes - NON_URGENT_REPEAT_STEP,
                  ),
                })
              }
              onIncrement={() =>
                update({
                  nonUrgentRepeatMinutes: Math.min(
                    NON_URGENT_REPEAT_MAX,
                    settings.nonUrgentRepeatMinutes + NON_URGENT_REPEAT_STEP,
                  ),
                })
              }
              theme={theme}
            />
          </Row>
        </Section>

        <Section
          title={t("settings.sections.alarm")}
          footer={
            settings.snoozeEnabled &&
            settings.snoozeMinutes > SNOOZE_WARNING_ABOVE &&
            t("settings.snoozeWarning", { count: SNOOZE_WARNING_ABOVE })
          }
          footerColor={COLORS.warning}
          theme={theme}
        >
          <Row label={t("settings.sound")} icon={Volume2} theme={theme} vertical>
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
          <Row label={t("settings.snooze")} icon={BellOff} theme={theme}>
            <Switch value={settings.snoozeEnabled} onValueChange={(v) => update({ snoozeEnabled: v })} />
          </Row>
          {settings.snoozeEnabled && (
            <Row label={t("settings.snoozeDuration")} icon={Timer} theme={theme}>
              <Stepper
                displayValue={t("common.minutes", { count: settings.snoozeMinutes })}
                onDecrement={() => update({ snoozeMinutes: Math.max(SNOOZE_MIN, settings.snoozeMinutes - 1) })}
                onIncrement={() => update({ snoozeMinutes: Math.min(SNOOZE_MAX, settings.snoozeMinutes + 1) })}
                theme={theme}
              />
            </Row>
          )}
        </Section>

        <Text style={[styles.versionFooter, { color: theme.textTertiary }]}>
          Spike {APP_VERSION}
        </Text>
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
  soundContainer: {
    flexWrap: "wrap",
    gap: 8,
  },
  soundButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  soundLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  versionFooter: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 28,
  },
});
