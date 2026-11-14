import { useAuth } from "@/features/auth/AuthContext";
import { MonitorContainer } from "@/features/monitor/containers/MonitorContainer";

export default function MonitorRoute() {
  const { credentials } = useAuth();

  if (!credentials) return null;

  return <MonitorContainer credentials={credentials} />;
}
