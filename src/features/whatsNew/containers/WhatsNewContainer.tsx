import { router } from "expo-router";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { WHATS_NEW_ITEMS } from "../constants";
import { WhatsNewView } from "../components/WhatsNewView";

export function WhatsNewContainer() {
  const { theme } = useSettingsContext();

  return (
    <WhatsNewView
      items={WHATS_NEW_ITEMS}
      theme={theme}
      onOpenSettings={() => {
        router.back();
        router.navigate("/settings");
      }}
      onClose={() => router.back()}
    />
  );
}
