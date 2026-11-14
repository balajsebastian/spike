import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { useOnboarding } from "../OnboardingContext";
import { DisclaimerView } from "../components/DisclaimerView";

export function DisclaimerContainer() {
  const { accept } = useOnboarding();
  const { theme } = useSettingsContext();
  const insets = useSafeAreaInsets();

  return <DisclaimerView theme={theme} insets={insets} onAccept={accept} />;
}
