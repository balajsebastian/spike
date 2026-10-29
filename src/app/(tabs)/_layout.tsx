import { useContext } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Tabs, TabList, TabTrigger, TabSlot } from "expo-router/ui";
import { TabsStateContext } from "expo-router/build/ui/TabContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Activity, Settings, MessageSquare, LogOut } from "lucide-react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";

const FEEDBACK_EMAIL = "mailto:balajdariussebastian@gmail.com?subject=Spike%20Feedback";

function TabButton({ name, href, icon: Icon, label, theme }: {
  name: string;
  href: string;
  icon: typeof Activity;
  label: string;
  theme: ThemeColors;
}) {
  const state = useContext(TabsStateContext);
  const isFocused = state?.routes[state.index]?.name === name;
  const color = isFocused ? theme.text : theme.textTertiary;

  return (
    <TabTrigger name={name} href={href} asChild>
      <Pressable style={styles.tab}>
        <Icon size={20} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </Pressable>
    </TabTrigger>
  );
}

export default function TabsLayout() {
  const { theme } = useSettingsContext();
  const { clear: logout } = useAuth();
  const insets = useSafeAreaInsets();

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
    <Tabs>
      <TabSlot />
      <TabList
        style={[
          styles.tabList,
          {
            backgroundColor: theme.surface,
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}
      >
        <TabButton name="index" href="/" icon={Activity} label="Monitor" theme={theme} />
        <TabButton name="settings" href="/settings" icon={Settings} label="Settings" theme={theme} />
        <TouchableOpacity style={styles.tab} onPress={handleFeedback}>
          <MessageSquare size={20} color={theme.textTertiary} />
          <Text style={[styles.tabLabel, { color: theme.textTertiary }]}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.danger} />
          <Text style={[styles.tabLabel, { color: COLORS.danger }]}>Logout</Text>
        </TouchableOpacity>
      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabList: {
    flexDirection: "row",
    paddingTop: 8,
    borderTopWidth: 0,
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
