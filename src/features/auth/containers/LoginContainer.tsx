import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { DexcomRegion } from "@/providers/dexcom/types";
import { LibreLinkUpClient } from "@/providers/libre/client";
import type { LibrePerson } from "@/providers/libre/types";
import { useSettingsContext } from "@/features/settings/SettingsContext";
import type { Credentials } from "../types";
import { DEMO_EMAIL, buildConnection, defaultDexcomRegion, type LoginSource } from "../helpers/connection";
import { describeLoginError, validateLoginForm } from "../helpers/loginErrors";
import { LoginForm } from "../components/LoginForm";
import { PersonPicker } from "../components/PersonPicker";

type LibreCredentials = Extract<Credentials, { source: "libre" }>;

interface Props {
  onLogin: (credentials: Credentials) => void;
}

/** Holds the form state and only saves credentials after the provider accepted them. */
export function LoginContainer({ onLogin }: Props) {
  const { theme } = useSettingsContext();
  const { t } = useTranslation();
  const [source, setSource] = useState<LoginSource>("dexcom");
  const [field1, setField1] = useState("");
  const [field2, setField2] = useState("");
  const [region, setRegion] = useState<DexcomRegion>(defaultDexcomRegion);
  const [error, setError] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  // A LibreLinkUp account that follows several people: who to show, before saving the login.
  const [pick, setPick] = useState<{ people: LibrePerson[]; credentials: LibreCredentials } | null>(null);

  const handleSourceChange = (newSource: LoginSource) => {
    setSource(newSource);
    setField1("");
    setField2("");
    setError(null);
  };

  const handleSubmit = async () => {
    const value1 = field1.trim();
    const value2 = field2.trim();

    if (value1.toLowerCase() === DEMO_EMAIL) {
      onLogin({ source: "demo" });
      return;
    }

    const invalid = validateLoginForm(source, value1, value2);
    if (invalid) {
      setError(t(invalid));
      return;
    }

    setError(null);
    setTesting(true);
    try {
      const { client, credentials } = buildConnection(source, value1, value2, region);
      await client.connect();
      if (credentials.source === "libre" && client instanceof LibreLinkUpClient && client.people.length > 1) {
        setPick({ people: client.people, credentials });
        return;
      }
      onLogin(credentials);
    } catch (err) {
      setError(t(describeLoginError(err, source).key));
    } finally {
      setTesting(false);
    }
  };

  if (pick) {
    return (
      <PersonPicker
        people={pick.people}
        theme={theme}
        onPick={(person) => onLogin({ ...pick.credentials, patientId: person.patientId })}
        onBack={() => setPick(null)}
      />
    );
  }

  return (
    <LoginForm
      source={source}
      field1={field1}
      field2={field2}
      region={region}
      error={error}
      testing={testing}
      theme={theme}
      onChangeSource={handleSourceChange}
      onChangeField1={setField1}
      onChangeField2={setField2}
      onChangeRegion={setRegion}
      onSubmit={handleSubmit}
    />
  );
}
