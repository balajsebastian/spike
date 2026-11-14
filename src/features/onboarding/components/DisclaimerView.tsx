import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { EdgeInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { BellRing, Lock, Smartphone, Stethoscope, type LucideIcon } from "lucide-react-native";
import iconImage from "@assets/icon.png";
import type { ThemeColors } from "@/features/settings/types";
import { DisclaimerPoint } from "./DisclaimerPoint";

const POINTS: { icon: LucideIcon; titleKey: string; bodyKey: string; important?: boolean }[] = [
  { icon: Smartphone, titleKey: "disclaimer.keepOpenTitle", bodyKey: "disclaimer.keepOpenBody", important: true },
  { icon: Stethoscope, titleKey: "disclaimer.notMedicalTitle", bodyKey: "disclaimer.notMedicalBody" },
  { icon: BellRing, titleKey: "disclaimer.supplementaryTitle", bodyKey: "disclaimer.supplementaryBody" },
  { icon: Lock, titleKey: "disclaimer.noDataTitle", bodyKey: "disclaimer.noDataBody" },
];

interface Props {
  theme: ThemeColors;
  insets: EdgeInsets;
  onAccept: () => void;
}

export function DisclaimerView({ theme, insets, onAccept }: Props) {
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 32 }]}>
        <Image source={iconImage} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>{t("disclaimer.title")}</Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>{t("disclaimer.intro")}</Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {POINTS.map((point, index) => (
            <View key={point.titleKey}>
              {index > 0 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
              <DisclaimerPoint
                icon={point.icon}
                title={t(point.titleKey)}
                body={t(point.bodyKey)}
                important={point.important}
                theme={theme}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, borderTopColor: theme.border, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.acceptBtn, { backgroundColor: theme.text }]}
          onPress={onAccept}
        >
          <Text style={[styles.acceptText, { color: theme.background }]}>{t("disclaimer.accept")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    // Keep the text readable on iPad instead of stretching it across the screen.
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  intro: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 28,
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 66,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  acceptBtn: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 17,
    fontWeight: "700",
  },
});
