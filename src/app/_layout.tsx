import { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Stack, ErrorBoundary as ExpoErrorBoundary } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { SettingsProvider, useSettingsContext } from "@/features/settings/SettingsContext";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { OnboardingProvider, useOnboarding } from "@/features/onboarding/OnboardingContext";
import { useTranslation } from "react-i18next";
import { useStartupUpdate } from "@/shared/lib/useStartupUpdate";
import "@/shared/lib/i18n";

export { ExpoErrorBoundary as ErrorBoundary };

// Hold the splash while we check for an OTA update (see useStartupUpdate).
SplashScreen.preventAutoHideAsync();

function KeepAwake() {
  useKeepAwake();
  return null;
}


function AppStack() {
  const { accepted, loading: onboardingLoading } = useOnboarding();
  const { credentials, loading: authLoading } = useAuth();
  const { theme } = useSettingsContext();
  const { t } = useTranslation();

  if (onboardingLoading || authLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textTertiary }]}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      <Stack.Protected guard={!accepted}>
        <Stack.Screen name="disclaimer" />
      </Stack.Protected>
      <Stack.Protected guard={accepted && !credentials}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!credentials}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="sound-picker"
          options={{
            presentation: "formSheet",
            animation: "default",
            sheetAllowedDetents: "fitToContents",
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: theme.background },
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 16,
  },
});

export default function RootLayout() {
  const updateChecked = useStartupUpdate();

  useEffect(() => {
    if (updateChecked) SplashScreen.hide();
  }, [updateChecked]);

  // Nothing mounts (no polling, no alarm) until we know the app will not restart into an update.
  if (!updateChecked) return null;

  return (
    <SettingsProvider>
      <AuthProvider>
        <OnboardingProvider>
          {/* Spike must stay on screen to keep checking glucose, so the screen never sleeps while it is open. */}
          <KeepAwake />
          <AppStack />
        </OnboardingProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
