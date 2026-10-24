import { useOnboarding } from "@/features/onboarding/OnboardingContext";
import { DisclaimerScreen } from "@/features/onboarding/DisclaimerScreen";

export default function DisclaimerRoute() {
  const { accept } = useOnboarding();
  return <DisclaimerScreen onAccept={accept} />;
}
