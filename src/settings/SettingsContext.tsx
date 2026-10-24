import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { DEFAULT_SETTINGS, THEMES, type Settings, type ThemeColors } from "./types";

const STORAGE_KEY = "app_settings";

interface SettingsContextValue {
  settings: Settings;
  theme: ThemeColors;
  update: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  theme: THEMES.dark,
  update: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY);
      if (raw) {
        try {
          setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
        } catch {}
      }
      setLoaded(true);
    })();
  }, []);

  const update = useCallback((partial: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, theme: THEMES[settings.theme], update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettingsContext() {
  return useContext(SettingsContext);
}
