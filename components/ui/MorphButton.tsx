import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";

interface MorphButtonProps {
  label: string;
  icon?: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  color?: string;
  expanded?: boolean;
}

export const MorphButton: React.FC<MorphButtonProps> = ({
  label,
  icon,
  onPress,
  color,
  expanded = false,
}) => {
  const colors = useColors();
  const activeColor = color || colors.primary;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value, { damping: 12 }) }],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.95;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.button,
          { 
            backgroundColor: activeColor,
            borderRadius: colors.radius.lg,
            ...colors.shadows.medium 
          },
          animatedStyle,
        ]}
      >
        <View style={styles.content}>
          {icon && (
            <Feather 
                name={icon} 
                size={20} 
                color="#fff" 
                style={expanded ? styles.iconMargin : {}} 
            />
          )}
          {expanded && (
            <Text style={styles.label}>{label}</Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconMargin: {
    marginRight: 8,
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});
