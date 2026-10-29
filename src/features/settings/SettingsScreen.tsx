import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Constants from "expo-constants";
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
  const previewSound = usePreviewSound();
  const unit = settings.unit;
  const unitLabel = unit === "mmol" ? "mmol/L" : "mg/dL";

  function thresholdDisplay(mgdl: number): string {
    return `${formatGlucose(mgdl, unit)} ${unitLabel}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <SectionHeader title="DISPLAY" theme={theme} />
        <Row label="Theme" theme={theme}>
          <Segmented
            options={[
              { label: "Dark", value: "dark" as const },
              { label: "Light", value: "light" as const },
            ]}
            value={settings.theme}
            onChange={(v) => update({ theme: v })}
            theme={theme}
          />
        </Row>
        <Row label="Unit" theme={theme}>
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
        <Row label="Keep Screen On" theme={theme}>
          <Switch
            value={settings.keepScreenOn}
            onValueChange={(v) => update({ keepScreenOn: v })}
          />
        </Row>

        <SectionHeader title="ALERT THRESHOLDS" theme={theme} />
        <Row label="Urgent Low" theme={theme}>
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
        <Row label="Low" theme={theme}>
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
        <Row label="High" theme={theme}>
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

        <SectionHeader title="ALERT TYPES" theme={theme} />
        <Row label="Urgent Low" theme={theme}>
          <Switch
            value={settings.urgentLowEnabled}
            onValueChange={(v) => update({ urgentLowEnabled: v })}
          />
        </Row>
        <Row label="Low" theme={theme}>
          <Switch
            value={settings.lowEnabled}
            onValueChange={(v) => update({ lowEnabled: v })}
          />
        </Row>
        <Row label="High" theme={theme}>
          <Switch
            value={settings.highEnabled}
            onValueChange={(v) => update({ highEnabled: v })}
          />
        </Row>
        <Row label="Rapid Fall" theme={theme}>
          <Switch
            value={settings.fallingEnabled}
            onValueChange={(v) => update({ fallingEnabled: v })}
          />
        </Row>
        <Row label="Rapid Rise" theme={theme}>
          <Switch
            value={settings.risingEnabled}
            onValueChange={(v) => update({ risingEnabled: v })}
          />
        </Row>

        <SectionHeader title="ALARM" theme={theme} />
        <Row label="Sound" theme={theme} vertical>
          <OptionGroup
            options={ALARM_SOUNDS}
            value={settings.alarmSound}
            onChange={(v) => {
              update({ alarmSound: v });
              previewSound(v);
            }}
            theme={theme}
            expand={false}
            containerStyle={{ flexWrap: "wrap", gap: 8 }}
            buttonStyle={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
            labelStyle={{ fontSize: 13, fontWeight: "500" }}
          />
        </Row>
        <Row label="Repeat Every" theme={theme}>
          <Stepper
            displayValue={`${settings.alarmRepeatMinutes} min`}
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
        <Row label="Snooze" theme={theme}>
          <Switch
            value={settings.snoozeEnabled}
            onValueChange={(v) => update({ snoozeEnabled: v })}
          />
        </Row>
        {settings.snoozeEnabled && (
          <>
            <Row label="Snooze Duration" theme={theme}>
              <Stepper
                displayValue={`${settings.snoozeMinutes} min`}
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
                Snoozing longer than {SNOOZE_WARNING_ABOVE} minutes may delay critical alerts. Use with caution.
              </Text>
            )}
          </>
        )}

        <SectionHeader title="ABOUT" theme={theme} />
        <Row label="Version" theme={theme}>
          <Text style={{ color: theme.textSecondary }}>{APP_VERSION}</Text>
        </Row>

        <View style={{ height: 60 }} />
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
  warning: {
    fontSize: 13,
    color: COLORS.warning,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
});
