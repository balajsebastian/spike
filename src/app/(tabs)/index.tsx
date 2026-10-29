import { useAuth } from "@/features/auth/AuthContext";
import { MonitorScreen } from "@/features/monitor/MonitorScreen";

export default function MonitorRoute() {
  const { credentials } = useAuth();

  if (!credentials) return null;

  return <MonitorScreen credentials={credentials} />;
}
