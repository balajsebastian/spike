import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { componentStyles } from "./components";
import { useSettingsContext } from "./SettingsContext";
import { usePreviewSound } from "./usePreviewSound";
import { ALARM_SOUNDS } from "./types";

/**
 * iOS-ringtone-style list shown in a form sheet sized to its content:
 * tapping a sound selects it and plays it, so you can compare before closing.
 */
export function SoundPickerSheet() {
  const { t } = useTranslation();
  const { settings, theme, update } = useSettingsContext();
  const previewSound = usePreviewSound();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {t("settings.sound")}
        </Text>
        <TouchableOpacity
          style={styles.done}
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Text style={[styles.doneText, { color: theme.text }]}>
            {t("common.done")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View
          style={[componentStyles.card, { backgroundColor: theme.surface }]}
        >
          {ALARM_SOUNDS.map((sound, index) => {
            const selected = sound.value === settings.alarmSound;
            return (
              <View key={sound.value}>
                {index > 0 && (
                  <View
                    style={[
                      styles.separator,
                      { backgroundColor: theme.border },
                    ]}
                  />
                )}
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={componentStyles.row}
                  onPress={() => {
                    update({ alarmSound: sound.value });
                    previewSound(sound.value);
                  }}
                >
                  <Text
                    style={[componentStyles.rowLabel, { color: theme.text }]}
                  >
                    {t(`sounds.${sound.value}`)}
                  </Text>
                  {selected && (
                    <Check size={20} color={theme.text} strokeWidth={2.5} />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        <Text
          style={[
            componentStyles.sectionFooter,
            { color: theme.textSecondary },
          ]}
        >
          {t("settings.soundHint")}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  done: {
    position: "absolute",
    right: 20,
  },
  doneText: {
    fontSize: 17,
    fontWeight: "600",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
});
