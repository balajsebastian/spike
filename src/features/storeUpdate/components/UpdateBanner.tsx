import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Download, X } from "lucide-react-native";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";

interface Props {
  theme: ThemeColors;
  top: number;
  onUpdate: () => void;
  onDismiss: () => void;
}

/** "A new version of Spike is available  [Update]  ×" */
export function UpdateBanner({ theme, top, onUpdate, onDismiss }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.banner, { top, backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Download size={18} color={COLORS.accent} />
      <Text style={[styles.text, { color: theme.text }]} numberOfLines={2}>
        {t("storeUpdate.available")}
      </Text>
      <TouchableOpacity style={styles.button} onPress={onUpdate}>
        <Text style={styles.buttonText}>{t("storeUpdate.update")}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDismiss} hitSlop={10} accessibilityLabel={t("storeUpdate.later")}>
        <X size={18} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    maxWidth: 520,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 14,
    paddingRight: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
