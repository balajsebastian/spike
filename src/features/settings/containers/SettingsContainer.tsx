import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Constants from "expo-constants";
import { URGENT_REPEAT_MINUTES } from "@/features/alarm/constants";
import { PREDICTION_MINUTES } from "@/features/alarm/helpers/prediction";
import { useSettingsContext } from "../SettingsContext";
import { SNOOZE_WARNING_ABOVE } from "../constants";
import {
  stepNightBrightness,
  stepNightTime,
  stepNoDataMinutes,
  stepRepeat,
  stepSnooze,
  stepThreshold,
} from "../helpers/steppers";
import { SettingsView } from "../components/SettingsView";

const APP_VERSION = Constants.expoConfig?.version ?? "1.0.0";

export function SettingsContainer() {
  const { settings, theme, update } = useSettingsContext();
  const insets = useSafeAreaInsets();

  const longSnooze = settings.snoozeEnabled && settings.snoozeMinutes > SNOOZE_WARNING_ABOVE;

  return (
    <SettingsView
      settings={settings}
      theme={theme}
      insets={insets}
      appVersion={APP_VERSION}
      urgentRepeatMinutes={URGENT_REPEAT_MINUTES}
      predictionMinutes={PREDICTION_MINUTES}
      snoozeWarningAbove={longSnooze ? SNOOZE_WARNING_ABOVE : null}
      onChange={update}
      onStepThreshold={(key, direction) => update(stepThreshold(settings, key, direction))}
      onStepRepeat={(direction) => update(stepRepeat(settings, direction))}
      onStepNoData={(direction) => update(stepNoDataMinutes(settings, direction))}
      onStepSnooze={(direction) => update(stepSnooze(settings, direction))}
      onStepNightTime={(key, direction) => update(stepNightTime(settings, key, direction))}
      onStepNightBrightness={(direction) => update(stepNightBrightness(settings, direction))}
      onPickSound={(kind) => router.push({ pathname: "/sound-picker", params: { kind } })}
    />
  );
}
