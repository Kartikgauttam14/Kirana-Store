import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";

const DEMO_OTP = "123456";

export default function OTPVerifyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { phone, role } = useLocalSearchParams<{ phone: string; role: string }>();
  const language = useAuthStore((s) => s.language);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef<Array<TextInput | null>>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (text: string, index: number) => {
    const v = text.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = v;
    setOtp(newOtp);
    if (v && index < 5) refs.current[index + 1]?.focus();
    if (newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (code === DEMO_OTP || code.length === 6) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const user = {
        id: `user_${Date.now()}`,
        phone: phone ?? "",
        name: role === "STORE_OWNER" ? "Store Owner" : "Customer",
        role: (role ?? "CUSTOMER") as "STORE_OWNER" | "CUSTOMER",
        language: language,
      };
      setAuth("demo_token_" + Date.now(), user);
      if (role === "STORE_OWNER") {
        router.replace("/(owner)/dashboard");
      } else {
        router.replace("/(customer)/home");
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        language === "hi" ? "गलत OTP" : "Wrong OTP",
        language === "hi"
          ? "कृपया सही OTP डालें (123456)"
          : "Please enter the correct OTP (use 123456 for demo)"
      );
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
    setLoading(false);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16),
        },
      ]}
    >
      <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { marginLeft: 16 }]}>
        <Feather name="arrow-left" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Feather name="message-square" size={32} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {language === "hi" ? "OTP सत्यापित करें" : "Verify OTP"}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {language === "hi"
            ? `+91 ${phone} पर OTP भेजा गया`
            : `OTP sent to +91 ${phone}`}
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { refs.current[index] = ref; }}
              style={[
                styles.otpBox,
                {
                  borderColor: digit ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                  color: colors.textPrimary,
                },
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              editable={!loading}
            />
          ))}
        </View>

        <Text style={[styles.demoHint, { color: colors.textSecondary }]}>
          Demo OTP: <Text style={{ fontWeight: "700", color: colors.primary }}>123456</Text>
        </Text>

        {loading && (
          <Text style={[styles.loadingText, { color: colors.primary }]}>
            {language === "hi" ? "सत्यापित हो रहा है..." : "Verifying..."}
          </Text>
        )}

        <TouchableOpacity
          style={styles.resendRow}
          onPress={() => {
            if (countdown > 0) return;
            setCountdown(60);
            setOtp(["", "", "", "", "", ""]);
            refs.current[0]?.focus();
          }}
          disabled={countdown > 0}
        >
          <Text style={[styles.resendText, { color: countdown > 0 ? colors.mutedForeground : colors.primary }]}>
            {countdown > 0
              ? `${language === "hi" ? "दोबारा भेजें" : "Resend OTP"} (${countdown}s)`
              : language === "hi" ? "OTP दोबारा भेजें" : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, padding: 24, gap: 18 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: { fontSize: 26, fontWeight: "800" },
  subtitle: { fontSize: 15, lineHeight: 22 },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    fontSize: 22,
    fontWeight: "700",
    maxWidth: 50,
  },
  demoHint: { fontSize: 13, textAlign: "center" },
  loadingText: { fontSize: 15, fontWeight: "600", textAlign: "center" },
  resendRow: { alignItems: "center", marginTop: 8 },
  resendText: { fontSize: 15, fontWeight: "600" },
});
