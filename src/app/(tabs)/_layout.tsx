import { Alert, Linking, useWindowDimensions } from "react-native";
import { NativeTabs } from "expo-router/native-tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettingsContext } from "@/features/settings/SettingsContext";

const FEEDBACK_ADDRESS = "balajdariussebastian@gmail.com";
const FEEDBACK_EMAIL = `mailto:${FEEDBACK_ADDRESS}?subject=Spike%20Feedback`;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const { width, height } = useWindowDimensions();

  function handleFeedback() {
    Linking.openURL(FEEDBACK_EMAIL).catch(() =>
      Alert.alert(t("feedback.cannotOpenEmail"), FEEDBACK_ADDRESS)
    );
  }

  function handleLogout() {
    Alert.alert(t("logout.title"), t("logout.message"), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("logout.confirm"), style: "destructive", onPress: logout },
    ]);
  }

  return (
    <NativeTabs
      hidden={width > height}
      tintColor={theme.text}
      iconColor={{ default: theme.textTertiary, selected: theme.text }}
      backgroundColor={theme.surface}
    >
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: theme.background }}>
        <NativeTabs.Trigger.Icon sf="waveform.path.ecg" md="monitor_heart" />
        <NativeTabs.Trigger.Label>{t("tabs.monitor")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor: theme.background }}>
        <NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} md="settings" />
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* Action tabs: `disabled` stops native selection, but `tabPress` still fires. */}
      <NativeTabs.Trigger name="feedback" disabled listeners={{ tabPress: handleFeedback }}>
        <NativeTabs.Trigger.Icon sf="bubble.left" md="chat_bubble" />
        <NativeTabs.Trigger.Label>{t("tabs.feedback")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logout" disabled listeners={{ tabPress: handleLogout }}>
        <NativeTabs.Trigger.Icon sf="rectangle.portrait.and.arrow.right" md="logout" />
        <NativeTabs.Trigger.Label>{t("tabs.logout")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
