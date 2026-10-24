import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import type { Credentials, CGMSource } from "../hooks/useCredentials";
import { DexcomShareClient } from "../dexcom/share-client";
import { LibreLinkUpClient } from "../libre/libre-client";
import { NightscoutClient } from "../nightscout/nightscout-client";
import { useSettingsContext } from "../settings/SettingsContext";

interface Props {
  onLogin: (credentials: Credentials) => void;
}

const SOURCES: { label: string; value: CGMSource }[] = [
  { label: "Dexcom", value: "dexcom" },
  { label: "Libre", value: "libre" },
  { label: "Nightscout", value: "nightscout" },
];

export function LoginScreen({ onLogin }: Props) {
  const { theme } = useSettingsContext();
  const [source, setSource] = useState<CGMSource>("dexcom");
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [region, setRegion] = useState<"eu" | "us">("eu");
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handleSourceChange = (s: CGMSource) => {
    setSource(s);
    setField1("");
    setField2("");
    setError(null);
  };

  const handleLogin = async () => {
    if (!field1.trim()) {
      setError(source === "nightscout" ? "Enter your Nightscout URL" : "Fill in all fields");
      return;
    }
    if (source !== "nightscout" && !field2.trim()) {
      setError("Fill in all fields");
      return;
    }

    setError(null);
    setTesting(true);

    try {
      switch (source) {
        case "dexcom": {
          const client = new DexcomShareClient({
            username: field1.trim(),
            password: field2.trim(),
            region,
          });
          await client.connect();
          onLogin({ source: "dexcom", username: field1.trim(), password: field2.trim(), region });
          break;
        }
        case "libre": {
          const client = new LibreLinkUpClient(field1.trim(), field2.trim());
          await client.connect();
          onLogin({ source: "libre", email: field1.trim(), password: field2.trim() });
          break;
        }
        case "nightscout": {
          const token = field2.trim() || undefined;
          const client = new NightscoutClient(field1.trim(), token);
          await client.connect();
          onLogin({ source: "nightscout", url: field1.trim(), token });
          break;
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("500")) {
        setError("Invalid credentials or account not found");
      } else {
        setError(msg);
      }
    } finally {
      setTesting(false);
    }
  };

  const field1Placeholder =
    source === "dexcom" ? "Username or email" :
    source === "libre" ? "Email" :
    "https://your-site.herokuapp.com";

  const field2Placeholder =
    source === "nightscout" ? "Token (optional)" : "Password";

  const hint =
    source === "dexcom"
      ? "Use the sharer's credentials (the account connected to the sensor), not a follower account."
      : source === "libre"
        ? "Use your LibreLinkUp credentials (the follower app, not LibreLink)."
        : "Enter your Nightscout site URL. Add a readable token if your site requires authentication.";

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={require("../../assets/icon.png")} style={styles.logo} />
      <Text style={[styles.title, { color: theme.text }]}>Spike</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Connect your CGM</Text>

      <View style={styles.sourceRow}>
        {SOURCES.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[
              styles.sourceBtn,
              { borderColor: theme.border },
              source === s.value && { borderColor: theme.text, backgroundColor: theme.surface },
            ]}
            onPress={() => handleSourceChange(s.value)}
            disabled={testing}
          >
            <Text
              style={[
                styles.sourceText,
                { color: theme.textTertiary },
                source === s.value && { color: theme.text },
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
        placeholder={field1Placeholder}
        placeholderTextColor={theme.textTertiary}
        value={field1}
        onChangeText={setField1}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={source === "nightscout" ? "url" : "default"}
        editable={!testing}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
        placeholder={field2Placeholder}
        placeholderTextColor={theme.textTertiary}
        value={field2}
        onChangeText={setField2}
        secureTextEntry={source !== "nightscout"}
        editable={!testing}
      />

      {source === "dexcom" && (
        <View style={styles.regionRow}>
          <TouchableOpacity
            style={[
              styles.regionBtn,
              { borderColor: theme.border },
              region === "eu" && { borderColor: theme.text, backgroundColor: theme.surface },
            ]}
            onPress={() => setRegion("eu")}
            disabled={testing}
          >
            <Text style={[styles.regionText, { color: theme.textTertiary }, region === "eu" && { color: theme.text }]}>
              EU
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.regionBtn,
              { borderColor: theme.border },
              region === "us" && { borderColor: theme.text, backgroundColor: theme.surface },
            ]}
            onPress={() => setRegion("us")}
            disabled={testing}
          >
            <Text style={[styles.regionText, { color: theme.textTertiary }, region === "us" && { color: theme.text }]}>
              US
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.loginBtn, { backgroundColor: theme.text }, testing && styles.loginBtnDisabled]}
        onPress={handleLogin}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.loginText, { color: theme.background }]}>Connect</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={[styles.hint, { color: theme.textTertiary }]}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: "center",
    marginBottom: 16,
    borderRadius: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
  },
  sourceRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  sourceBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  sourceText: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
  },
  regionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  regionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  regionText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loginBtn: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  loginBtnDisabled: {
    opacity: 0.5,
  },
  loginText: {
    fontSize: 18,
    fontWeight: "700",
  },
  error: {
    color: "#ff1744",
    fontSize: 13,
    textAlign: "center",
    marginTop: 16,
  },
  hint: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
