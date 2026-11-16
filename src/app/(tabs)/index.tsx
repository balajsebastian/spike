import { View } from "react-native";
import { useAuth } from "@/features/auth/AuthContext";
import { MonitorContainer } from "@/features/monitor/containers/MonitorContainer";
import { UpdateBannerContainer } from "@/features/storeUpdate/containers/UpdateBannerContainer";
import { WhatsNewTrigger } from "@/features/whatsNew/containers/WhatsNewTrigger";

export default function MonitorRoute() {
  const { credentials } = useAuth();

  if (!credentials) return null;

  return (
    <View style={{ flex: 1 }}>
      <MonitorContainer credentials={credentials} />
      <UpdateBannerContainer />
      <WhatsNewTrigger />
    </View>
  );
}
