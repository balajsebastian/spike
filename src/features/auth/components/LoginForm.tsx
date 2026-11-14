import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import iconImage from "@assets/icon.png";
import { OptionGroup } from "@/shared/OptionGroup";
import { COLORS } from "@/shared/colors";
import type { ThemeColors } from "@/features/settings/types";
import type { DexcomRegion } from "@/providers/dexcom/types";
import { DEXCOM_REGIONS, LOGIN_SOURCES, type LoginSource } from "../helpers/connection";

interface Props {
  source: LoginSource;
  field1: string;
  field2: string;
  region: DexcomRegion;
  error: string | null;
  testing: boolean;
  theme: ThemeColors;
  onChangeSource: (source: LoginSource) => void;
  onChangeField1: (value: string) => void;
  onChangeField2: (value: string) => void;
  onChangeRegion: (region: DexcomRegion) => void;
  onSubmit: () => void;
}

/** Source picker, two fields (labels depend on the source), Dexcom region, connect button. */
export function LoginForm({
  source,
  field1,
  field2,
  region,
  error,
  testing,
  theme,
  onChangeSource,
  onChangeField1,
  onChangeField2,
  onChangeRegion,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const inputStyle = [styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={iconImage} style={styles.logo} />
      <Text style={[styles.title, { color: theme.text }]}>Spike</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t("login.subtitle")}</Text>

      <OptionGroup
        options={LOGIN_SOURCES}
        value={source}
        onChange={onChangeSource}
        theme={theme}
        disabled={testing}
        containerStyle={styles.sourceRow}
      />

      <TextInput
        style={inputStyle}
        placeholder={t(`login.${source}.field1`)}
        placeholderTextColor={theme.textTertiary}
        value={field1}
        onChangeText={onChangeField1}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={source === "nightscout" ? "url" : "default"}
        editable={!testing}
      />

      <TextInput
        style={inputStyle}
        placeholder={t(`login.${source}.field2`)}
        placeholderTextColor={theme.textTertiary}
        value={field2}
        onChangeText={onChangeField2}
        secureTextEntry={source !== "nightscout"}
        editable={!testing}
      />

      {source === "dexcom" && (
        <OptionGroup
          options={DEXCOM_REGIONS}
          value={region}
          onChange={onChangeRegion}
          theme={theme}
          disabled={testing}
          containerStyle={styles.regionRow}
          buttonStyle={styles.regionButton}
          labelStyle={styles.regionLabel}
        />
      )}

      <TouchableOpacity
        style={[styles.loginBtn, { backgroundColor: theme.text }, testing && styles.loginBtnDisabled]}
        onPress={onSubmit}
        disabled={testing}
      >
        {testing ? (
          <ActivityIndicator color={theme.background} />
        ) : (
          <Text style={[styles.loginText, { color: theme.background }]}>{t("login.connect")}</Text>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Text style={[styles.hint, { color: theme.textTertiary }]}>{t(`login.${source}.hint`)}</Text>
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
