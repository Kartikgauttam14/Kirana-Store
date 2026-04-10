import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextStyle, StyleProp } from "react-native";
import Animated, {
  useSharedValue,
  withSpring,
  useDerivedValue,
} from "react-native-reanimated";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: StyleProp<TextStyle>;
  duration?: number;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  style,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    const safeVal = (value == null || isNaN(value)) ? 0 : value;
    animatedValue.value = withSpring(safeVal, {
      damping: 15,
      stiffness: 100,
    });
  }, [value]);

  // Using derived value for rendering logic (optional, for future robust implementation)
  const derivedText = useDerivedValue(() => {
    return `${prefix}${animatedValue.value.toFixed(decimals)}${suffix}`;
  });

  return (
    <CounterDisplay 
        style={style} 
        derivedText={derivedText} 
        prefix={prefix} 
        suffix={suffix} 
        value={value} 
        decimals={decimals} 
    />
  );
};

const CounterDisplay = ({ style, derivedText, prefix, suffix, value, decimals }: any) => {
    const safeValue = (value == null || isNaN(value)) ? 0 : value;
    const [display, setDisplay] = React.useState(`${prefix}${safeValue.toFixed(decimals)}${suffix}`);
    
    // This is a bit of a hack for React Native Text which doesn't love animated values directly
    // In a real production app with Reanimated 3, we'd use a more robust solution
    // But for "wow" effect, even a spring-based state update is better than static
    
    useEffect(() => {
        let interval: any;
        const parsed = parseFloat(display.replace(prefix, "").replace(suffix, "").replace(/[^0-9.\-]/g, ""));
        const startValue = isNaN(parsed) ? 0 : parsed;
        const endValue = (safeValue == null || isNaN(safeValue)) ? 0 : safeValue;
        const duration = 500;
        const startTime = Date.now();

        const update = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out quad
            const easedProgress = progress * (2 - progress);
            const current = startValue + (endValue - startValue) * easedProgress;
            setDisplay(`${prefix}${current.toFixed(decimals)}${suffix}`);
            
            if (progress < 1) {
                interval = requestAnimationFrame(update);
            }
        };

        interval = requestAnimationFrame(update);
        return () => cancelAnimationFrame(interval);
    }, [safeValue]);

    return <Text style={style}>{display}</Text>;
};
