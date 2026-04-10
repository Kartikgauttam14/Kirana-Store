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
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";
import { BrandLogo } from "@/components/ui/BrandLogo";

const { width, height } = Dimensions.get("window");

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <LinearGradient 
        colors={['#020617', '#0A1628', '#020617']} 
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative orbs */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.orb, { backgroundColor: '#10B981', top: '5%', left: '-15%', opacity: 0.08 }]} />
        <View style={[styles.orb, { backgroundColor: '#6366F1', bottom: '10%', right: '-20%', opacity: 0.12 }]} />
        <View style={[styles.orbSmall, { backgroundColor: '#F59E0B', top: '35%', right: '5%', opacity: 0.06 }]} />
        <View style={[styles.orbSmall, { backgroundColor: '#10B981', bottom: '35%', left: '10%', opacity: 0.05 }]} />
      </View>

      {/* Grid pattern overlay for depth */}
      <View style={[StyleSheet.absoluteFill, styles.gridOverlay]} />

      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === "web" ? 40 : 16) }]}>
        {/* Language Toggle */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <TouchableOpacity
            style={styles.langToggle}
            onPress={() => setLanguage(language === "en" ? "hi" : "en")}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
              style={styles.langGradient}
            >
              <Feather name="globe" size={14} color="rgba(255,255,255,0.6)" />
              <Text style={styles.langText}>{language === "en" ? "हिंदी" : "ENG"}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.logoArea}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.logoGradient}
              >
                <BrandLogo size={56} />
              </LinearGradient>
              {/* Glow ring */}
              <View style={styles.logoRing} />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(800)} style={styles.titleArea}>
            <Text style={styles.appName}>
              Kirana<Text style={styles.appNameAccent}>AI</Text>
            </Text>
            <View style={styles.taglinePill}>
              <View style={styles.taglineDot} />
              <Text style={styles.tagline}>
                {language === "hi"
                  ? "आपकी दुकान का AI साथी"
                  : "Your Shop's AI Companion"}
              </Text>
            </View>
          </Animated.View>
        </View>

        {/* Bottom Section */}
        <Animated.View 
          entering={FadeInUp.delay(600).duration(900)}
          style={[styles.bottomSection, { paddingBottom: insets.bottom + 40 }]}
        >
          <View style={styles.questionRow}>
            <View style={styles.questionLine} />
            <Text style={styles.question}>
              {language === "hi" ? "आप कौन हैं?" : "Choose your role"}
            </Text>
            <View style={styles.questionLine} />
          </View>

          <View style={styles.roleGrid}>
            <RoleCard 
              title={language === "hi" ? "दुकान मालिक" : "Store Owner"}
              subtitle={language === "hi" ? "दुकान और बिक्री प्रबंधित करें" : "Manage inventory, billing & analytics"}
              icon="storefront-outline"
              gradient={['#10B981', '#059669']}
              accentColor="#10B981"
              onPress={() => selectRole("STORE_OWNER")}
              delay={700}
            />
            
            <RoleCard 
              title={language === "hi" ? "ग्राहक" : "Customer"}
              subtitle={language === "hi" ? "नज़दीकी दुकानों से ऑर्डर करें" : "Shop & order from local stores nearby"}
              icon="shopping-outline"
              gradient={['#6366F1', '#4F46E5']}
              accentColor="#6366F1"
              onPress={() => selectRole("CUSTOMER")}
              delay={850}
            />
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

function RoleCard({ title, subtitle, icon, gradient, accentColor, onPress, delay }: any) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }]
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).duration(700)}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => scale.value = 0.96}
        onPressOut={() => scale.value = 1}
        activeOpacity={1}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.roleCard}>
            {/* Background gradient accent */}
            <LinearGradient
              colors={[accentColor + '15', 'transparent']}
              style={[StyleSheet.absoluteFill, { borderRadius: 24 }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            
            <View style={styles.roleCardContent}>
              {/* Icon section */}
              <View style={styles.roleIconSection}>
                <LinearGradient
                  colors={gradient}
                  style={styles.roleIconGradient}
                >
                  <MaterialCommunityIcons name={icon} size={28} color="#fff" />
                </LinearGradient>
              </View>
              
              {/* Text section */}
              <View style={styles.roleTextSection}>
                <Text style={styles.roleTitle}>{title}</Text>
                <Text style={styles.roleSub}>{subtitle}</Text>
              </View>
              
              {/* Arrow */}
              <View style={[styles.roleArrow, { backgroundColor: accentColor + '15' }]}>
                <Feather name="arrow-right" size={18} color={accentColor} />
              </View>
            </View>
            
            {/* Bottom accent line */}
            <LinearGradient
              colors={[...gradient, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.roleAccentLine}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  content: { flex: 1, paddingHorizontal: 24, zIndex: 1 },
  
  // Background
  orb: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  orbSmall: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  gridOverlay: {
    opacity: 0.02,
    ...(Platform.OS === 'web' ? {
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)',
      backgroundSize: '30px 30px',
    } : {}),
  },
  
  // Language Toggle
  langToggle: {
    alignSelf: "flex-end",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  langGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  langText: { 
    color: "rgba(255,255,255,0.7)", 
    fontWeight: "700", 
    fontSize: 13, 
    letterSpacing: 0.5,
  },
  
  // Hero
  heroSection: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center",
    gap: 28,
  },
  logoArea: {
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
      },
      web: {
        boxShadow: '0 12px 40px rgba(16, 185, 129, 0.3)',
      },
    }),
  },
  logoRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.15)',
  },
  titleArea: {
    alignItems: 'center',
    gap: 14,
  },
  appName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -2,
  },
  appNameAccent: {
    color: '#10B981',
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.12)',
  },
  taglineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.5,
  },
  
  // Bottom
  bottomSection: {
    gap: 24,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  questionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  question: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  roleGrid: {
    flexDirection: "column",
    gap: 14,
  },
  
  // Role Card
  roleCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    overflow: 'hidden',
  },
  roleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
  },
  roleIconSection: {},
  roleIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  roleTextSection: {
    flex: 1,
    gap: 4,
  },
  roleTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: '#fff',
    letterSpacing: -0.5,
  },
  roleSub: { 
    fontSize: 13, 
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
  },
  roleArrow: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  roleAccentLine: {
    height: 2,
    width: '100%',
  },
});
