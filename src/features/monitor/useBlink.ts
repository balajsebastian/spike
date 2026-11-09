import { useEffect, useState } from "react";
import { Animated, Easing } from "react-native";
import { BLINK_CYCLE_MS, BLINK_ON_MS, BLINK_DIM_OPACITY, BLINK_FADE_MS } from "./constants";

export function useBlink(active: boolean): Animated.Value {
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!active) {
      opacity.setValue(1);
      return;
    }

    const fade = (toValue: number) =>
      Animated.timing(opacity, {
        toValue,
        duration: BLINK_FADE_MS,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      });

    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(BLINK_ON_MS - BLINK_FADE_MS),
        fade(BLINK_DIM_OPACITY),
        Animated.delay(BLINK_CYCLE_MS - BLINK_ON_MS - BLINK_FADE_MS),
        fade(1),
      ]),
    );
    loop.start();

    return () => {
      loop.stop();
      opacity.setValue(1);
    };
  }, [active, opacity]);

  return opacity;
}
