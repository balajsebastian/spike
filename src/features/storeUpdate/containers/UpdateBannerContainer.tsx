import { Linking, Platform, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { STORE_URLS } from "../constants";
import { useStoreUpdate } from "../hooks/useStoreUpdate";
import { UpdateBanner } from "../components/UpdateBanner";

/** Tells users on an old native build (which no longer gets OTA updates) to update from the store. */
export function UpdateBannerContainer() {
  const { theme } = useSettingsContext();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { available, dismiss } = useStoreUpdate();

  // Landscape is the nightstand view: keep it clean.
  if (!available || width > height) return null;

  const storeUrl = Platform.OS === "ios" ? STORE_URLS.ios : STORE_URLS.android;

  return (
    <UpdateBanner
      theme={theme}
      top={insets.top + 8}
      onUpdate={() => Linking.openURL(storeUrl).catch(() => {})}
      onDismiss={dismiss}
    />
  );
}
