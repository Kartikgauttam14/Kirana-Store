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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";

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
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    router.push({
      pathname: "/(auth)/otp-verify",
      params: { phone, role: role ?? "CUSTOMER" },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.dark }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[colors.dark, "#1E293B"]}
        style={StyleSheet.absoluteFill}
      />
      
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "web" ? 40 : 16) },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.topInfo}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + "20" }]}>
            <LinearGradient
              colors={[colors.primary, colors.warning]}
              style={styles.iconGradient}
            >
              <Feather name="smartphone" size={32} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={[styles.title, { color: colors.white }]}>
            {language === "hi" ? "अपना मोबाइल नंबर डालें" : "Verification"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textPlaceholder }]}>
            {language === "hi"
              ? "हम आपको OTP भेजेंगे"
              : "We'll send you an OTP to verify your account"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard intensity={10} tint="light" borderRadius={24} style={styles.inputContainer}>
            <View
              style={[
                styles.phoneRow,
                {
                  borderColor: phone.length > 0 && !isValid ? colors.danger : "transparent",
                },
              ]}
            >
              <View style={styles.countryCode}>
                <Text style={[styles.flag]}>🇮🇳</Text>
                <Text style={[styles.code, { color: colors.white }]}>+91</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: "rgba(255,255,255,0.1)" }]} />
              <TextInput
                style={[styles.input, { color: colors.white }]}
                placeholder="00000 00000"
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                autoFocus
                selectionColor={colors.primary}
              />
            </View>
          </GlassCard>
        </Animated.View>

        {phone.length > 0 && !isValid && (
          <Text style={[styles.errorText, { color: colors.danger }]}>
            {language === "hi"
              ? "नंबर 6-9 से शुरू होना चाहिए और 10 अंक का होना चाहिए"
              : "Please enter a valid mobile number"}
          </Text>
        )}

        <Animated.View entering={FadeInDown.delay(300)}>
          <TouchableOpacity
            style={styles.sendBtnWrapper}
            onPress={handleSendOTP}
            disabled={!isValid || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isValid ? [colors.primary, colors.warning] : ["#475569", "#334155"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sendBtn}
            >
              {loading ? (
                <Text style={styles.sendBtnText}>
                  {language === "hi" ? "भेज रहे हैं..." : "Processing..."}
                </Text>
              ) : (
                <>
                  <Text style={styles.sendBtnText}>
                    {language === "hi" ? "OTP भेजें" : "Get OTP"}
                  </Text>
                  <Feather name="arrow-right" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <Text style={[styles.terms, { color: colors.textPlaceholder }]}>
          {language === "hi"
            ? "जारी रखकर आप हमारी सेवा शर्तों से सहमत हैं"
            : "By continuing, you agree to our terms and privacy policy"}
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 32,
  },
  topInfo: {
    gap: 12,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 32, fontWeight: "900", letterSpacing: -1 },
  subtitle: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
  inputContainer: {
    padding: 4,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    borderWidth: 2,
    borderRadius: 20,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
  },
  flag: { fontSize: 24 },
  code: { fontSize: 18, fontWeight: "700" },
  divider: { width: 1, height: "40%" },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    paddingHorizontal: 16,
    letterSpacing: 2,
  },
  errorText: { fontSize: 14, fontWeight: "600", marginTop: -16, textAlign: "center" },
  sendBtnWrapper: {
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  sendBtn: {
    height: 64,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  sendBtnText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  terms: { fontSize: 12, textAlign: "center", marginTop: 8, opacity: 0.7 },
});
