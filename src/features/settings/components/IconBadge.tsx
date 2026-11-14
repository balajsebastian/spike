import { View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { listStyles } from "./styles";

interface Props {
  icon: LucideIcon;
  backgroundColor: string;
}

export function IconBadge({ icon: Icon, backgroundColor }: Props) {
  return (
    <View style={[listStyles.iconBadge, { backgroundColor }]}>
      <Icon size={18} color="#fff" strokeWidth={2.25} />
    </View>
  );
}
