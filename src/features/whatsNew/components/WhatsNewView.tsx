import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import type { LucideIcon } from "lucide-react-native";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";
import { DisclaimerPoint } from "@/features/onboarding/components/DisclaimerPoint";

interface Props {
  items: { key: string; icon: LucideIcon; title: string; body: string }[];
  theme: ThemeColors;
  onOpenSettings: () => void;
  onClose: () => void;
}

export function WhatsNewView({ items, theme, onOpenSettings, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>{t("whatsNew.title")}</Text>
      </View>

      <View style={styles.content}>
        <View>
          {items.map(({ key, icon, title, body }) => (
            <DisclaimerPoint key={key} icon={icon} title={title} body={body} theme={theme} />
          ))}
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.border }]} onPress={onOpenSettings}>
            <Text style={[styles.buttonText, { color: theme.text }]}>{t("whatsNew.openSettings")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.primary]} onPress={onClose}>
            <Text style={[styles.buttonText, styles.primaryText]}>{t("whatsNew.gotIt")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Same structure as the sound picker sheet, which sizes itself correctly with "fitToContents".
  container: {
    paddingTop: 8,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
    // Keep it readable on iPad.
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderCurve: "continuous",
  },
  primary: {
    backgroundColor: COLORS.accent,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  primaryText: {
    color: "#fff",
  },
});
