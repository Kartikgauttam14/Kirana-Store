import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { 
  FadeInDown, 
  FadeInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrandLogo } from "@/components/ui/BrandLogo";

const { width } = Dimensions.get("window");

export default function RoleSelectScreen() {
  const colors = useColors();
  const router = useRouter();
  const setLanguage = useAuthStore((s) => s.setLanguage);
  const language = useAuthStore((s) => s.language);
  const insets = useSafeAreaInsets();

  const selectRole = (role: "STORE_OWNER" | "CUSTOMER") => {
    (router as any).push({ pathname: "/(auth)/phone-input", params: { role } });
  };

  return (
    <View style={[styles.container, { backgroundColor: "#020617" }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Dynamic Background */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.glowBall, { backgroundColor: colors.primary, top: '10%', left: '-20%', opacity: 0.15 }]} />
        <View style={[styles.glowBall, { backgroundColor: colors.secondary, bottom: '20%', right: '-30%', opacity: 0.2 }]} />
        <View style={[styles.glowBall, { backgroundColor: colors.accent, top: '40%', right: '10%', width: 200, height: 200, opacity: 0.1 }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 10) }]}>
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLanguage(language === "en" ? "hi" : "en")}
        >
          <BlurView intensity={30} tint="dark" style={styles.langBlur}>
            <Text style={styles.langText}>{language === "en" ? "हिंदी" : "English"}</Text>
          </BlurView>
        </TouchableOpacity>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(1000)} 
          style={styles.hero}
        >
          <View style={styles.logoWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.success]}
              style={styles.logoGradient}
            >
              <BrandLogo size={64} />
            </LinearGradient>
            <View style={[styles.logoGlow, { backgroundColor: colors.primary }]} />
          </View>
          <Text style={styles.appName}>KiranaAI</Text>
          <View style={[styles.taglineBadge, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.tagline, { color: colors.primary }]}>
              {language === "hi"
                ? "आपकी दुकान का AI साथी"
                : "Your Shop's AI Companion"}
            </Text>
          </View>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(500).duration(1000)}
          style={[styles.bottomSection, { paddingBottom: insets.bottom + 50 }]}
        >
          <Text style={[styles.question, { color: colors.white }]}>
            {language === "hi" ? "आप कौन हैं?" : "Who are you?"}
          </Text>

          <View style={styles.roleGrid}>
            <RoleCard 
              title={language === "hi" ? "दुकान मालिक" : "Store Owner"}
              subtitle={language === "hi" ? "Manage Shop & Sales" : "Manage inventory & billing"}
              icon="storefront-outline"
              color={colors.primary}
              onPress={() => selectRole("STORE_OWNER")}
            />
            
            <RoleCard 
              title={language === "hi" ? "ग्राहक" : "Customer"}
              subtitle={language === "hi" ? "Order from nearby" : "Shop from local stores"}
              icon="shopping-outline"
              color={colors.secondary}
              onPress={() => selectRole("CUSTOMER")}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function RoleCard({ title, subtitle, icon, color, onPress }: any) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 12 }) }]
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => scale.value = 0.97}
      onPressOut={() => scale.value = 1}
      activeOpacity={0.9}
      style={styles.roleOption}
    >
      <Animated.View style={[styles.roleCardContainer, animatedStyle]}>
        <GlassCard intensity={25} tint="dark" style={styles.roleGlass} borderRadius={28}>
          <LinearGradient
            colors={[color + "25", "transparent"]}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          <View style={styles.roleCardInner}>
             <View style={[styles.roleIconBox, { backgroundColor: color + "30", borderColor: color + "40", borderWidth: 1 }]}>
               <MaterialCommunityIcons name={icon} size={32} color={color} />
             </View>
             <View style={styles.roleTextContainer}>
               <Text style={[styles.roleTitle, { color: "#fff" }]}>{title}</Text>
               <Text style={[styles.roleSub, { color: "rgba(255,255,255,0.7)" }]}>{subtitle}</Text>
             </View>
             <View style={[styles.roleArrow, { backgroundColor: color + '20' }]}>
               <Feather name="arrow-right" size={20} color={color} />
             </View>
          </View>
        </GlassCard>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, zIndex: 1 },
  glowBall: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  langToggle: {
    alignSelf: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  langBlur: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  langText: { color: "#fff", fontWeight: "800", fontSize: 13, textTransform: 'uppercase' },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20 },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    filter: 'blur(30px)',
    zIndex: -1,
  },
  logoGradient: {
    width: 110,
    height: 110,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
    ...Platform.select({
        ios: {
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.4,
            shadowRadius: 20,
        }
    })
  },
  appName: {
    fontSize: 52,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1.5,
    marginTop: 10,
  },
  taglineBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  tagline: {
    fontSize: 15,
    fontWeight: "800",
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bottomSection: {
    gap: 30,
  },
  question: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  roleGrid: {
    flexDirection: "column",
    gap: 16,
  },
  roleOption: {
    width: '100%',
  },
  roleCardContainer: {
    width: '100%',
  },
  roleGlass: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  roleCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  roleIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextContainer: {
    flex: 1,
    gap: 4,
  },
  roleTitle: { 
    fontSize: 22, 
    fontWeight: "900", 
    letterSpacing: -0.5,
  },
  roleSub: { 
    fontSize: 14, 
    fontWeight: '600',
    lineHeight: 20,
  },
  roleArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
