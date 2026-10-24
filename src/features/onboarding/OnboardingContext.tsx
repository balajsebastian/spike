import { createContext, useContext, type ReactNode } from "react";
import { useDisclaimer } from "./useDisclaimer";

interface OnboardingContextValue {
  accepted: boolean;
  loading: boolean;
  accept: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  accepted: false,
  loading: true,
  accept: async () => {},
});

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const value = useDisclaimer();
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
