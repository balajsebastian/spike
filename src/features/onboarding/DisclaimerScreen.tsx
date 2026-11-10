import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { COLORS } from "@/shared/colors";
import { useTranslation } from "react-i18next";

interface Props {
  onAccept: () => void;
}

export function DisclaimerScreen({ onAccept }: Props) {
  const { theme } = useSettingsContext();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t("disclaimer.title")}</Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>{t("disclaimer.intro")}</Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningHeading}>{t("disclaimer.keepOpenTitle")}</Text>
          <Text style={[styles.body, { color: theme.text }]}>{t("disclaimer.keepOpenBody")}</Text>
        </View>

        <Text style={[styles.heading, { color: theme.text }]}>{t("disclaimer.notMedicalTitle")}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{t("disclaimer.notMedicalBody")}</Text>

        <Text style={[styles.heading, { color: theme.text }]}>{t("disclaimer.noDataTitle")}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{t("disclaimer.noDataBody")}</Text>

        <Text style={[styles.heading, { color: theme.text }]}>{t("disclaimer.supplementaryTitle")}</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>{t("disclaimer.supplementaryBody")}</Text>
      </ScrollView>

      <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.text }]} onPress={onAccept}>
        <Text style={[styles.acceptText, { color: theme.background }]}>{t("disclaimer.accept")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingTop: 80,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  warningBox: {
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
  },
  warningHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.warning,
    marginBottom: 8,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  acceptBtn: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
