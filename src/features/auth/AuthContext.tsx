import { createContext, useContext, type ReactNode } from "react";
import { useCredentials } from "./useCredentials";
import type { Credentials } from "./types";

interface AuthContextValue {
  credentials: Credentials | null;
  loading: boolean;
  save: (creds: Credentials) => Promise<void>;
  clear: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  credentials: null,
  loading: true,
  save: async () => {},
  clear: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useCredentials();
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
