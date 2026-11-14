import { Alert, Linking, useWindowDimensions } from "react-native";
import { NativeTabs } from "expo-router/native-tabs";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettingsContext } from "@/features/settings/SettingsContext";

// Android icons are bundled PNGs (Material Symbols): `md` icons need the expo-symbols native module,
// which the store builds don't include, and crash the app on launch. iOS uses `sf`, which takes priority.
const TAB_ICONS = {
  monitor: require("../../../assets/tab-icons/monitor_heart.png"),
  settings: require("../../../assets/tab-icons/settings.png"),
  feedback: require("../../../assets/tab-icons/chat_bubble.png"),
  logout: require("../../../assets/tab-icons/logout.png"),
};

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
      // Before iOS 26 (no Liquid Glass) the bar turns transparent at the scroll edge and content shows through.
      disableTransparentOnScrollEdge
      shadowColor={theme.border}
      // Android (Material 3): show every label so the active icon doesn't jump up, and use a neutral
      // indicator instead of the default purple pill, which made the white icon hard to see.
      labelVisibilityMode="labeled"
      indicatorColor={theme.border}
    >
      <NativeTabs.Trigger name="index" contentStyle={{ backgroundColor: theme.background }}>
        <NativeTabs.Trigger.Icon sf="waveform.path.ecg" src={TAB_ICONS.monitor} />
        <NativeTabs.Trigger.Label>{t("tabs.monitor")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" contentStyle={{ backgroundColor: theme.background }}>
        <NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} src={TAB_ICONS.settings} />
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      {/* Action tabs: `disabled` stops native selection, but `tabPress` still fires. */}
      <NativeTabs.Trigger name="feedback" disabled listeners={{ tabPress: handleFeedback }}>
        <NativeTabs.Trigger.Icon sf="bubble.left" src={TAB_ICONS.feedback} />
        <NativeTabs.Trigger.Label>{t("tabs.feedback")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="logout" disabled listeners={{ tabPress: handleLogout }}>
        <NativeTabs.Trigger.Icon sf="rectangle.portrait.and.arrow.right" src={TAB_ICONS.logout} />
        <NativeTabs.Trigger.Label>{t("tabs.logout")}</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
