import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");

export default function PhoneInputScreen() {
  const colors = useColors();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const language = useAuthStore((s) => s.language);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const isValid = /^[6-9]\d{9}$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValid) {
      Alert.alert(
        language === "hi" ? "गलत नंबर" : "Invalid Number",
        language === "hi"
          ? "कृपया 10 अंकों का सही मोबाइल नंबर डालें"
          : "Please enter a valid 10-digit mobile number"
      );
      return;
    }
    setLoading(true);
    
    // Try sending real OTP via Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: "+91" + phone,
      });

      if (error) throw error;

    } catch (e: any) {
      // Graceful fallback for Demo/Dev mode if SMS is disabled or anon key missing 
      console.log("Supabase OTP failed (falling back to demo mode):", e.message);
    } finally {
      setLoading(false);
      // We navigate regardless to allow demo code "123456" validation
      router.push({
        pathname: "/(auth)/otp-verify",
        params: { phone, role: role ?? "CUSTOMER" },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: "#020617" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Decorative Glows */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.glow, { backgroundColor: colors.primary, top: '5%', right: '-10%', opacity: 0.1 }]} />
        <View style={[styles.glow, { backgroundColor: colors.secondary, bottom: '15%', left: '-20%', opacity: 0.15 }]} />
      </View>

      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 10) }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={[styles.backBtn, { borderColor: "rgba(255,255,255,0.1)", borderWidth: 1 }]}
        >
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.topInfo}>
          <GlassCard style={styles.iconContainer} intensity={20} borderRadius={24}>
             <LinearGradient
               colors={[colors.primary, colors.success]}
               style={styles.iconGradient}
             >
               <Feather name="smartphone" size={32} color="#fff" />
             </LinearGradient>
          </GlassCard>

          <Text style={[styles.title, { color: colors.white }]}>
            {language === "hi" ? "मोबाइल नंबर" : "Verification"}
          </Text>
          <Text style={[styles.subtitle, { color: "rgba(255,255,255,0.6)" }]}>
            {language === "hi"
              ? "हम आपको OTP भेजेंगे"
              : "Enter your 10-digit mobile number to receive a secure OTP code."}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard intensity={8} tint="dark" borderRadius={28} style={styles.inputWrapper}>
            <View style={[styles.phoneRow, { borderColor: phone.length > 0 && !isValid ? colors.danger + "40" : "rgba(255,255,255,0.05)" }]}>
              <View style={styles.countryCode}>
                <Text style={styles.flag}>🇮🇳</Text>
                <Text style={[styles.code, { color: colors.white }]}>+91</Text>
                <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.white }]}
                placeholder="00000 00000"
                placeholderTextColor="rgba(255,255,255,0.2)"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
                selectionColor={colors.primary}
              />
            </View>
          </GlassCard>
          
          {phone.length > 0 && !isValid && (
            <Animated.Text entering={FadeInRight} style={[styles.errorText, { color: colors.danger }]}>
              {language === "hi" ? "कृपया सही मोबाइल नंबर डालें" : "Invalid mobile number format"}
            </Animated.Text>
          )}
        </Animated.View>

        <View style={styles.spacer} />

        <Animated.View entering={FadeInDown.delay(300)} style={styles.footer}>
          <TouchableOpacity
            style={styles.sendBtnWrapper}
            onPress={handleSendOTP}
            disabled={!isValid || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isValid ? [colors.primary, colors.success] : ["#1E293B", "#0F172A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendBtn}
            >
              {loading ? (
                 <View style={styles.btnRow}>
                    <Text style={styles.sendBtnText}>
                      {language === "hi" ? "भेज रहे हैं..." : "Sending..."}
                    </Text>
                 </View>
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.sendBtnText}>
                    {language === "hi" ? "OTP प्राप्त करें" : "Get Verification Code"}
                  </Text>
                  <Feather name="chevron-right" size={22} color="#fff" />
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={[styles.terms, { color: "rgba(255,255,255,0.4)" }]}>
            {language === "hi"
              ? "जारी रखकर आप हमारी सेवा शर्तों से सहमत हैं"
              : "By proceeding, you agree to our Terms of Service."}
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  glow: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  header: { paddingHorizontal: 24, paddingBottom: 8 },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  topInfo: {
    gap: 20,
    marginTop: 20,
  },
  iconContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 36, fontWeight: "900", letterSpacing: -1.5 },
  subtitle: { fontSize: 17, lineHeight: 26, fontWeight: "500" },
  inputWrapper: {
    padding: 2,
    marginTop: 40,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 72,
    borderRadius: 26,
    borderWidth: 1.5,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingLeft: 20,
    paddingRight: 10,
  },
  flag: { fontSize: 28 },
  code: { fontSize: 20, fontWeight: "800" },
  divider: { width: 1.5, height: "40%", marginLeft: 10 },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "800",
    paddingHorizontal: 10,
    letterSpacing: 1.5,
  },
  errorText: { fontSize: 13, fontWeight: "700", marginTop: 12, marginLeft: 4 },
  spacer: { flex: 1 },
  footer: { gap: 24 },
  sendBtnWrapper: {
    borderRadius: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
      }
    })
  },
  sendBtn: {
    height: 68,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sendBtnText: { fontSize: 18, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  terms: { fontSize: 12, textAlign: "center", fontWeight: '600', letterSpacing: 0.3 },
});
