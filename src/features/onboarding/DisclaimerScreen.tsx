import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { BellRing, Lock, Smartphone, Stethoscope, type LucideIcon } from "lucide-react-native";
import iconImage from "@assets/icon.png";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { COLORS } from "@/shared/colors";

interface Props {
  onAccept: () => void;
}

interface Point {
  icon: LucideIcon;
  titleKey: string;
  bodyKey: string;
  /** The one rule that decides whether alarms work at all, so it gets the warning color. */
  important?: boolean;
}

const POINTS: Point[] = [
  { icon: Smartphone, titleKey: "disclaimer.keepOpenTitle", bodyKey: "disclaimer.keepOpenBody", important: true },
  { icon: Stethoscope, titleKey: "disclaimer.notMedicalTitle", bodyKey: "disclaimer.notMedicalBody" },
  { icon: BellRing, titleKey: "disclaimer.supplementaryTitle", bodyKey: "disclaimer.supplementaryBody" },
  { icon: Lock, titleKey: "disclaimer.noDataTitle", bodyKey: "disclaimer.noDataBody" },
];

export function DisclaimerScreen({ onAccept }: Props) {
  const { theme } = useSettingsContext();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 32 }]}>
        <Image source={iconImage} style={styles.logo} />
        <Text style={[styles.title, { color: theme.text }]}>{t("disclaimer.title")}</Text>
        <Text style={[styles.intro, { color: theme.textSecondary }]}>{t("disclaimer.intro")}</Text>

        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          {POINTS.map((point, index) => {
            const Icon = point.icon;
            return (
              <View key={point.titleKey}>
                {index > 0 && <View style={[styles.separator, { backgroundColor: theme.border }]} />}
                <View style={styles.point}>
                  <View
                    style={[styles.iconBadge, { backgroundColor: point.important ? COLORS.warning : theme.iconBadge }]}
                  >
                    <Icon size={20} color={point.important ? "#000" : "#fff"} strokeWidth={2.2} />
                  </View>
                  <View style={styles.pointText}>
                    <Text style={[styles.pointTitle, { color: point.important ? COLORS.warning : theme.text }]}>
                      {t(point.titleKey)}
                    </Text>
                    <Text style={[styles.pointBody, { color: theme.textSecondary }]}>{t(point.bodyKey)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  point: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pointText: {
    flex: 1,
    gap: 4,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  pointBody: {
    fontSize: 14,
    lineHeight: 20,
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
