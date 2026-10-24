import { useRouter } from "expo-router";
import { SettingsScreen } from "@/features/settings/SettingsScreen";

export default function SettingsRoute() {
  const router = useRouter();
  return <SettingsScreen onBack={() => router.back()} />;
}
