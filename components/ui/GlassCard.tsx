import React from "react";
import { StyleSheet, View, ViewProps, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { useColors } from "@/hooks/useColors";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue 
} from "react-native-reanimated";

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: "light" | "dark" | "default";
  borderRadius?: number;
  hoverScale?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 60,
  tint = "light",
  borderRadius = 24,
  hoverScale = 1.02,
  ...props
}) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value, { damping: 15 }) }],
    };
  });

  const handlePressIn = () => {
    scale.value = hoverScale;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const isWeb = Platform.OS === "web";

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          borderRadius,
          ...colors.shadows.medium 
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      {...props}
    >
      {Platform.OS !== "android" ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={[styles.blur, { borderRadius }]}
        >
          <View style={[
            styles.content, 
            { 
              borderColor: colors.glassBorder,
              backgroundColor: colors.glassSurface 
            }
          ]}>
            {children}
          </View>
        </BlurView>
      ) : (
        <View style={[
          styles.fallback, 
          { 
            borderRadius, 
            backgroundColor: tint === "light" ? "rgba(255,255,255,0.85)" : "rgba(15,23,42,0.85)",
            borderColor: colors.glassBorder
          }
        ]}>
          {children}
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    borderWidth: 1.5,
  },
  fallback: {
    flex: 1,
    padding: 20,
    borderWidth: 1.5,
  }
});
