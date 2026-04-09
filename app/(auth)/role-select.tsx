import { Feather } from "@expo/vector-icons";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/ui/GlassCard";
import { BrandLogo } from "@/components/ui/BrandLogo";

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
      <LinearGradient
        colors={[colors.dark, "#1E293B", "#0F172A"]}
        style={[StyleSheet.absoluteFill]}
      />
      
      {/* Decorative gradient blobs */}
      <View style={[styles.blob, { backgroundColor: colors.primary, top: -50, right: -50, opacity: 0.2 }]} />
      <View style={[styles.blob, { backgroundColor: colors.secondary, bottom: -50, left: -50, opacity: 0.15 }]} />

      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === "web" ? 40 : 20) }]}>
        <TouchableOpacity
          style={styles.langToggle}
          onPress={() => setLanguage(language === "en" ? "hi" : "en")}
        >
          <BlurView intensity={20} tint="light" style={styles.langBlur}>
            <Text style={styles.langText}>{language === "en" ? "हिंदी" : "English"}</Text>
          </BlurView>
        </TouchableOpacity>

        <Animated.View 
          entering={FadeInDown.delay(200).duration(800)} 
          style={styles.hero}
        >
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[colors.primary, colors.warning]}
              style={styles.logoGradient}
            >
              <BrandLogo size={56} />
            </LinearGradient>
          </View>
          <Text style={styles.appName}>KiranaAI</Text>
          <Text style={[styles.tagline, { color: colors.textPlaceholder }]}>
            {language === "hi"
              ? "आपकी दुकान का AI सहायक"
              : "AI-Powered Kirana Management"}
          </Text>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(400).duration(800)}
          style={[styles.bottomSection, { paddingBottom: insets.bottom + 40 }]}
        >
          <Text style={[styles.question, { color: colors.white }]}>
            {language === "hi" ? "आप कौन हैं?" : "Who are you?"}
          </Text>

          <View style={styles.roleGrid}>
            <TouchableOpacity
              onPress={() => selectRole("STORE_OWNER")}
              activeOpacity={0.9}
              style={styles.roleOption}
            >
              <GlassCard intensity={15} tint="light" style={styles.roleGlass} borderRadius={24}>
                <View style={[styles.roleIconContainer, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="home" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.white }]}>
                  {language === "hi" ? "दुकान मालिक" : "Store Owner"}
                </Text>
                <Text style={[styles.roleSub, { color: colors.textPlaceholder }]}>
                  {language === "hi"
                    ? "दुकान प्रबंधित करें"
                    : "Manage your store"}
                </Text>
                <View style={styles.arrowContainer}>
                  <Feather name="arrow-right" size={18} color={colors.primary} />
                </View>
              </GlassCard>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => selectRole("CUSTOMER")}
              activeOpacity={0.9}
              style={styles.roleOption}
            >
              <GlassCard intensity={15} tint="light" style={styles.roleGlass} borderRadius={24}>
                <View style={[styles.roleIconContainer, { backgroundColor: colors.secondaryLight }]}>
                  <Feather name="shopping-cart" size={28} color={colors.secondary} />
                </View>
                <Text style={[styles.roleTitle, { color: colors.white }]}>
                  {language === "hi" ? "ग्राहक" : "Customer"}
                </Text>
                <Text style={[styles.roleSub, { color: colors.textPlaceholder }]}>
                  {language === "hi"
                    ? "पास की दुकानों से खरीदें"
                    : "Shop nearby stores"}
                </Text>
                <View style={styles.arrowContainer}>
                  <Feather name="arrow-right" size={18} color={colors.secondary} />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  content: { flex: 1, paddingHorizontal: 24 },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  langToggle: {
    alignSelf: "flex-end",
    borderRadius: 20,
    overflow: "hidden",
  },
  langBlur: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  langText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  hero: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  logoContainer: {
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 17,
    fontWeight: "500",
    textAlign: "center",
  },
  bottomSection: {
    gap: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  roleGrid: {
    flexDirection: "row",
    gap: 16,
  },
  roleOption: {
    flex: 1,
  },
  roleGlass: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  roleTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  roleSub: { fontSize: 12, marginTop: 4, textAlign: "center", paddingHorizontal: 8 },
  arrowContainer: {
    marginTop: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
});

import { BlurView } from "expo-blur";
