import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSettingsContext } from "@/features/settings/SettingsContext";

interface Props {
  onAccept: () => void;
}

export function DisclaimerScreen({ onAccept }: Props) {
  const { theme } = useSettingsContext();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Before you start</Text>

        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Spike is a personal helper tool that displays glucose readings from your CGM
          (Dexcom, Libre, or Nightscout). It is provided as-is, with no warranties.
        </Text>

        <Text style={[styles.heading, { color: theme.text }]}>Not a medical device</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          This app is NOT a medical device and should NOT be used as your sole source for glucose
          monitoring. Always rely on your official CGM receiver or app for medical decisions.
        </Text>

        <Text style={[styles.heading, { color: theme.text }]}>No data collection</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          Your credentials are stored securely on your device only. Glucose data is fetched directly
          from your CGM provider's servers to your phone. We do not collect, store, or transmit any of your data.
        </Text>

        <Text style={[styles.heading, { color: theme.text }]}>Alarms are supplementary</Text>
        <Text style={[styles.body, { color: theme.textSecondary }]}>
          The alarms in this app are meant to supplement, not replace, your CGM alerts. Do not
          disable your CGM alarms.
        </Text>
      </ScrollView>

      <TouchableOpacity style={[styles.acceptBtn, { backgroundColor: theme.text }]} onPress={onAccept}>
        <Text style={[styles.acceptText, { color: theme.background }]}>I understand, continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 32,
    paddingTop: 80,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
  },
  heading: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 24,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  acceptBtn: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  acceptText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
