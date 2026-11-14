import { useAuth } from "@/features/auth/AuthContext";
import { LoginContainer } from "@/features/auth/containers/LoginContainer";

export default function LoginRoute() {
  const { save } = useAuth();
  return <LoginContainer onLogin={save} />;
}
