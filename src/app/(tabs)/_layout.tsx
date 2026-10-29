import { Alert, Linking, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Activity, Settings, MessageSquare, LogOut } from "lucide-react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { COLORS } from "@/shared/colors";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";

const FEEDBACK_EMAIL = "mailto:balajdariussebastian@gmail.com?subject=Spike%20Feedback";

const TAB_ICONS: Record<string, typeof Activity> = {
  index: Activity,
  settings: Settings,
};

function CustomTabBar({ state, descriptors, navigateToTab }: BottomTabBarProps) {
  const { theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  if (width > height) return null;

  function handleFeedback() {
    Linking.openURL(FEEDBACK_EMAIL).catch(() =>
      Alert.alert("Cannot Open Email", "balajdariussebastian@gmail.com")
    );
  }

  function handleLogout() {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <View style={[styles.bar, { backgroundColor: theme.surface, paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const color = isFocused ? theme.text : theme.textTertiary;
        const Icon = TAB_ICONS[route.name] ?? Activity;

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tab}
            activeOpacity={0.5}
            onPress={() => {
              if (!isFocused) navigateToTab(route.key);
            }}
          >
            <Icon size={20} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{options.title ?? route.name}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity style={styles.tab} activeOpacity={0.5} onPress={handleFeedback}>
        <MessageSquare size={20} color={theme.textTertiary} />
        <Text style={[styles.tabLabel, { color: theme.textTertiary }]}>Feedback</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.tab} activeOpacity={0.5} onPress={handleLogout}>
        <LogOut size={20} color={COLORS.danger} />
        <Text style={[styles.tabLabel, { color: COLORS.danger }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: "Monitor" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
});
