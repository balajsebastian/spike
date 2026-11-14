import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";

interface Props {
  reason: "invalid" | "locked";
  theme: ThemeColors;
  onLoginAgain: () => void;
}

/** Shown when the CGM account rejected the saved login and polling stopped. */
export function CredentialsNotice({ reason, theme, onLoginAgain }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.box}>
      <Text style={styles.text}>
        {t(reason === "locked" ? "monitor.accountLocked" : "monitor.credentialsRejected")}
      </Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: theme.text }]} onPress={onLoginAgain}>
        <Text style={[styles.buttonText, { color: theme.background }]}>{t("monitor.loginAgain")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 14,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.danger,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
