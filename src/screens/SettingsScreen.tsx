import type { ReactNode } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettingsContext } from "../settings/SettingsContext";
import { formatGlucose, type ThemeColors } from "../settings/types";
import {
  COLORS,
  THRESHOLD_MIN,
  THRESHOLD_MAX,
  THRESHOLD_STEP,
  ALARM_REPEAT_MIN,
  ALARM_REPEAT_MAX,
  SNOOZE_MIN,
  SNOOZE_MAX,
  SNOOZE_WARNING_ABOVE,
} from "../constants";

const FEEDBACK_EMAIL = "balajdariussebastian@gmail.com";
const FEEDBACK_URL = `mailto:${FEEDBACK_EMAIL}?subject=Spike%20Feedback`;

interface Props {
  onBack: () => void;
}

function SectionHeader({ title, theme }: { title: string; theme: ThemeColors }) {
  return <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{title}</Text>;
}

function Row({ label, theme, children }: { label: string; theme: ThemeColors; children: ReactNode }) {
  return (
    <View style={[styles.row, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      <View style={styles.rowRight}>{children}</View>
    </View>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  theme,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  theme: ThemeColors;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: theme.background }]}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segmentedBtn,
            value === opt.value && { backgroundColor: theme.text },
          ]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            style={[
              styles.segmentedText,
              { color: value === opt.value ? theme.background : theme.textSecondary },
            ]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Stepper({
  displayValue,
  onDecrement,
  onIncrement,
  theme,
}: {
  displayValue: string;
  onDecrement: () => void;
  onIncrement: () => void;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
        onPress={onDecrement}
      >
        <Text style={[styles.stepperBtnText, { color: theme.text }]}>-</Text>
      </TouchableOpacity>
      <Text style={[styles.stepperValue, { color: theme.text }]}>{displayValue}</Text>
      <TouchableOpacity
        style={[styles.stepperBtn, { backgroundColor: theme.background }]}
        onPress={onIncrement}
      >
        <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

async function openFeedback() {
  const canOpen = await Linking.canOpenURL(FEEDBACK_URL);
  if (canOpen) {
    Linking.openURL(FEEDBACK_URL);
  } else {
    Alert.alert("No Mail App", `Send feedback to ${FEEDBACK_EMAIL}`);
  }
}

export function SettingsScreen({ onBack }: Props) {
  const { settings, theme, update } = useSettingsContext();
  const unit = settings.unit;
  const unitLabel = unit === "mmol" ? "mmol/L" : "mg/dL";

  function thresholdDisplay(mgdl: number): string {
    return `${formatGlucose(mgdl, unit)} ${unitLabel}`;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} hitSlop={16}>
          <Text style={[styles.backBtn, { color: COLORS.accent }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

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

        <SectionHeader title="ABOUT" theme={theme} />
        <Row label="Version" theme={theme}>
          <Text style={{ color: theme.textSecondary }}>1.0.0</Text>
        </Row>
        <TouchableOpacity
          style={[styles.row, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
          onPress={openFeedback}
        >
          <Text style={[styles.rowLabel, { color: COLORS.accent }]}>Send Feedback</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: {
    fontSize: 17,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "500",
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 16,
    flexShrink: 1,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    padding: 2,
  },
  segmentedBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentedText: {
    fontSize: 14,
    fontWeight: "500",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepperValue: {
    fontSize: 13,
    fontWeight: "500",
    minWidth: 85,
    textAlign: "center",
  },
  warning: {
    fontSize: 13,
    color: COLORS.warning,
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 4,
  },
});
