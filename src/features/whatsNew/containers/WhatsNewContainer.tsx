import { Platform } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { WHATS_NEW_ITEMS } from "../constants";
import { WhatsNewView } from "../components/WhatsNewView";

export function WhatsNewContainer() {
  const { t } = useTranslation();
  const { theme } = useSettingsContext();
  const items = WHATS_NEW_ITEMS.map(({ key, icon, perPlatform }) => ({
    key,
    icon,
    title: t(`whatsNew.items.${key}.title`),
    body: t(`whatsNew.items.${key}.${perPlatform ? `body_${Platform.OS}` : "body"}`),
  }));

  return (
    <WhatsNewView
      items={items}
      theme={theme}
      onOpenSettings={() => {
        router.back();
        router.navigate("/settings");
      }}
      onClose={() => router.back()}
    />
  );
}
