import { useAuth } from "@/features/auth/AuthContext";
import { LoginScreen } from "@/features/auth/LoginScreen";

export default function LoginRoute() {
  const { save } = useAuth();
  return <LoginScreen onLogin={save} />;
}
