import { View, Text, StyleSheet } from "react-native";
import { Stack, ErrorBoundary as ExpoErrorBoundary } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { SettingsProvider, useSettingsContext } from "@/features/settings/SettingsContext";
import { AuthProvider, useAuth } from "@/features/auth/AuthContext";
import { OnboardingProvider, useOnboarding } from "@/features/onboarding/OnboardingContext";

export { ExpoErrorBoundary as ErrorBoundary };

function KeepAwake() {
  useKeepAwake();
  return null;
}

function KeepAwakeWrapper() {
  const { settings } = useSettingsContext();
  if (!settings.keepScreenOn) return null;
  return <KeepAwake />;
}

function AppStack() {
  const { accepted, loading: onboardingLoading } = useOnboarding();
  const { credentials, loading: authLoading } = useAuth();
  const { theme } = useSettingsContext();

  if (onboardingLoading || authLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textTertiary }]}>Loading...</Text>
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
        <Stack.Screen name="index" />
        <Stack.Screen name="settings" />
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
  return (
    <SettingsProvider>
      <AuthProvider>
        <OnboardingProvider>
          <KeepAwakeWrapper />
          <AppStack />
        </OnboardingProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
