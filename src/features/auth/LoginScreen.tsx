import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { DexcomShareClient } from "@/providers/dexcom/client";
import { LibreLinkUpClient } from "@/providers/libre/client";
import { NightscoutClient } from "@/providers/nightscout/client";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import { OptionGroup } from "@/shared/OptionGroup";
import { COLORS } from "@/shared/colors";
import iconImage from "@assets/icon.png";
import type { Credentials, CGMSource } from "./types";

interface Props {
  onLogin: (credentials: Credentials) => void;
}

const SOURCES: { label: string; value: LoginSource }[] = [
  { label: "Dexcom", value: "dexcom" },
  { label: "Libre", value: "libre" },
  { label: "Nightscout", value: "nightscout" },
];

const REGIONS: { label: string; value: "eu" | "us" }[] = [
  { label: "EU", value: "eu" },
  { label: "US", value: "us" },
];

type LoginSource = Exclude<CGMSource, "demo">;

function buildConnection(source: LoginSource, field1: string, field2: string, region: "eu" | "us") {
  switch (source) {
    case "dexcom":
      return {
        client: new DexcomShareClient({ username: field1, password: field2, region }),
        credentials: { source, username: field1, password: field2, region } as const,
      };
    case "libre":
      return {
        client: new LibreLinkUpClient(field1, field2),
        credentials: { source, email: field1, password: field2 } as const,
      };
    case "nightscout": {
      const token = field2 || undefined;
      return {
        client: new NightscoutClient(field1, token),
        credentials: { source, url: field1, token } as const,
      };
    }
  }
}

export function LoginScreen({ onLogin }: Props) {
  const { theme } = useSettingsContext();
  const { t } = useTranslation();
  const [source, setSource] = useState<LoginSource>("dexcom");
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [region, setRegion] = useState<"eu" | "us">("eu");
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const resetForm = () => {
    setField1("");
    setField2("");
    setError(null);
  };

  const handleSourceChange = (newSource: LoginSource) => {
    setSource(newSource);
    resetForm();
  };

  const handleLogin = async () => {
    const trimmedField1 = field1.trim();
    const trimmedField2 = field2.trim();

    if (trimmedField1.toLowerCase() === "demo@spike-cgm.app") {
      onLogin({ source: "demo" });
      return;
    }

    if (!trimmedField1) {
      setError(source === "nightscout" ? t("login.errors.nightscoutUrl") : t("login.errors.fillAll"));
      return;
    }
    if (source !== "nightscout" && !trimmedField2) {
      setError(t("login.errors.fillAll"));
      return;
    }

    setError(null);
    setTesting(true);

    try {
      const { client, credentials } = buildConnection(source, trimmedField1, trimmedField2, region);
      await client.connect();
      onLogin(credentials);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes("500") ? t("login.errors.invalidCredentials") : msg);
    } finally {
      setTesting(false);
    }
  };

  const config = {
    field1: t(`login.${source}.field1`),
    field2: t(`login.${source}.field2`),
    hint: t(`login.${source}.hint`),
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={iconImage} style={styles.logo} />
      <Text style={[styles.title, { color: theme.text }]}>Spike</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t("login.subtitle")}</Text>

      <OptionGroup
        options={SOURCES}
        value={source}
        onChange={handleSourceChange}
        theme={theme}
        disabled={testing}
        containerStyle={styles.sourceRow}
      />

      <TextInput
        style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
        placeholder={config.field1}
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
        placeholder={config.field2}
        placeholderTextColor={theme.textTertiary}
        value={field2}
        onChangeText={setField2}
        secureTextEntry={source !== "nightscout"}
        editable={!testing}
      />

      {source === "dexcom" && (
        <OptionGroup
          options={REGIONS}
          value={region}
          onChange={setRegion}
          theme={theme}
          disabled={testing}
          containerStyle={styles.regionRow}
          buttonStyle={styles.regionButton}
          labelStyle={styles.regionLabel}
        />
      )}

      <TouchableOpacity
        style={[styles.loginBtn, { backgroundColor: theme.text }, testing && styles.loginBtnDisabled]}
        onPress={handleLogin}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.loginText, { color: theme.background }]}>{t("login.connect")}</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={[styles.hint, { color: theme.textTertiary }]}>{config.hint}</Text>
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
    marginBottom: 24,
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
    gap: 12,
    marginBottom: 24,
  },
  regionButton: {
    paddingVertical: 12,
  },
  regionLabel: {
    fontSize: 16,
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
    color: COLORS.danger,
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
