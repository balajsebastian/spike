import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react-native";
import { ALARM_SOUNDS, type AlarmSound, type ThemeColors } from "../types";
import { listStyles } from "./styles";

interface Props {
  title: string;
  selected: AlarmSound;
  theme: ThemeColors;
  onSelect: (sound: AlarmSound) => void;
  onDone: () => void;
}

/** iOS-ringtone-style list: tapping a sound selects it (the container also plays it). */
export function SoundPickerView({ title, selected, theme, onSelect, onDone }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <TouchableOpacity style={styles.done} onPress={onDone} hitSlop={12}>
          <Text style={[styles.doneText, { color: theme.text }]}>{t("common.done")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[listStyles.card, { backgroundColor: theme.surface }]}>
          {ALARM_SOUNDS.map((sound, index) => (
            <View key={sound.value}>
              {index > 0 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
              <TouchableOpacity activeOpacity={0.6} style={listStyles.row} onPress={() => onSelect(sound.value)}>
                <Text style={[listStyles.rowLabel, { color: theme.text }]}>{t(`sounds.${sound.value}`)}</Text>
                {sound.value === selected && <Check size={20} color={theme.text} strokeWidth={2.5} />}
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={[listStyles.sectionFooter, { color: theme.textSecondary }]}>{t("settings.soundHint")}</Text>
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
