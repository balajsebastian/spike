import { useRouter } from "expo-router";
import { useAuth } from "@/features/auth/AuthContext";
import { MonitorScreen } from "@/features/monitor/MonitorScreen";

export default function MonitorRoute() {
  const { credentials, clear } = useAuth();
  const router = useRouter();

  if (!credentials) return null;

  return (
    <MonitorScreen
      credentials={credentials}
      onLogout={clear}
      onOpenSettings={() => router.push("/settings")}
    />
  );
}
