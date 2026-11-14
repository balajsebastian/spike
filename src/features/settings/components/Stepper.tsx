import { Text, TouchableOpacity, View } from "react-native";
import type { ThemeColors } from "../types";
import type { StepDirection } from "../helpers/steppers";
import { listStyles } from "./styles";

interface Props {
  displayValue: string;
  onStep: (direction: StepDirection) => void;
  theme: ThemeColors;
}

/** "−  value  +" capsule. */
export function Stepper({ displayValue, onStep, theme }: Props) {
  return (
    <View style={[listStyles.stepper, { backgroundColor: theme.background }]}>
      <TouchableOpacity style={listStyles.stepperBtn} onPress={() => onStep(-1)} hitSlop={6}>
        <Text style={[listStyles.stepperBtnText, { color: theme.text }]}>−</Text>
      </TouchableOpacity>
      <Text style={[listStyles.stepperValue, { color: theme.text }]}>{displayValue}</Text>
      <TouchableOpacity style={listStyles.stepperBtn} onPress={() => onStep(1)} hitSlop={6}>
        <Text style={[listStyles.stepperBtnText, { color: theme.text }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}
