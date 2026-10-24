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

  useEffect(function loadSettings() {
    SecureStore.getItemAsync(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          }
        } catch {
          SecureStore.deleteItemAsync(STORAGE_KEY);
        }
      }
      setLoaded(true);
    });
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
