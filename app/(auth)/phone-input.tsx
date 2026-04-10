import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useRef } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";

const { width } = Dimensions.get("window");

export default function PhoneInputScreen() {
  const colors = useColors();
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();
  const language = useAuthStore((s) => s.language);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  const isValid = /^[6-9]\d{9}$/.test(phone);

  // Format phone for display: "98765 43210"
  const formatPhone = (num: string) => {
    if (num.length <= 5) return num;
    return num.slice(0, 5) + " " + num.slice(5);
  };

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

  const hasError = phone.length > 0 && phone.length < 10 && !focused;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Background */}
      <LinearGradient 
        colors={['#020617', '#0A1628', '#020617']} 
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Decorative Orbs */}
      <View style={StyleSheet.absoluteFill}>
        <View style={[styles.orb, { backgroundColor: '#10B981', top: '0%', right: '-15%', opacity: 0.08 }]} />
        <View style={[styles.orb, { backgroundColor: '#6366F1', bottom: '10%', left: '-25%', opacity: 0.1 }]} />
      </View>

      {/* Header */}
      <Animated.View 
        entering={FadeInDown.delay(100).duration(500)}
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 30 : 10) }]}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        
        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          <View style={[styles.stepDot, styles.stepActive]} />
          <View style={[styles.stepLine, styles.stepLineActive]} />
          <View style={[styles.stepDot, phone.length === 10 ? styles.stepActive : styles.stepInactive]} />
          <View style={styles.stepLine} />
          <View style={styles.stepDot} />
        </View>
        
        <View style={{ width: 44 }} />
      </Animated.View>

      <View style={styles.content}>
        {/* Top Info */}
        <Animated.View entering={FadeInDown.delay(200).duration(700)} style={styles.topInfo}>
          <View style={styles.iconBadge}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.iconGradient}
            >
              <Feather name="smartphone" size={28} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>
            {language === "hi" ? "मोबाइल नंबर" : "Phone Number"}
          </Text>
          <Text style={styles.subtitle}>
            {language === "hi"
              ? "हम आपको एक OTP कोड भेजेंगे।\nयह पूरी तरह सुरक्षित है।"
              : "We'll send you a one-time verification code.\nYour number is safe with us."}
          </Text>
        </Animated.View>

        {/* Phone Input Section */}
        <Animated.View entering={FadeInDown.delay(400).duration(700)} style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {language === "hi" ? "मोबाइल नंबर दर्ज करें" : "MOBILE NUMBER"}
          </Text>
          
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
            style={[
              styles.inputCard, 
              focused && styles.inputCardFocused,
              hasError && styles.inputCardError,
            ]}
          >
            {/* Country Code */}
            <View style={styles.countrySection}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.countryCode}>+91</Text>
            </View>
            
            {/* Separator */}
            <View style={[
              styles.separator,
              focused && { backgroundColor: 'rgba(16,185,129,0.3)' },
            ]} />
            
            {/* Input Area */}
            <View style={styles.inputArea}>
              <TextInput
                ref={inputRef}
                style={styles.phoneInput}
                placeholder="00000 00000"
                placeholderTextColor="rgba(255,255,255,0.15)"
                keyboardType="numeric"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoFocus
                selectionColor="#10B981"
                caretHidden={false}
              />
            </View>
            
            {/* Checkmark */}
            {isValid && (
              <Animated.View entering={FadeInRight.duration(300)} style={styles.validBadge}>
                <Feather name="check" size={16} color="#fff" />
              </Animated.View>
            )}
          </TouchableOpacity>
          
          {/* Error / Helper text */}
          {hasError ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.helperRow}>
              <Feather name="alert-circle" size={13} color="#EF4444" />
              <Text style={styles.errorText}>
                {language === "hi" ? "कृपया सही 10 अंकों का नंबर डालें" : "Enter a valid 10-digit number starting with 6-9"}
              </Text>
            </Animated.View>
          ) : (
            <View style={styles.helperRow}>
              <Feather name="lock" size={12} color="rgba(255,255,255,0.25)" />
              <Text style={styles.helperText}>
                {language === "hi" ? "256-बिट एन्क्रिप्टेड" : "End-to-end encrypted"}
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.spacer} />

        {/* Footer CTA */}
        <Animated.View entering={FadeInUp.delay(500).duration(600)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            onPress={handleSendOTP}
            disabled={!isValid || loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isValid ? ['#10B981', '#059669'] : ['#1E293B', '#0F172A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.ctaButton,
                !isValid && styles.ctaDisabled,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <View style={styles.ctaContent}>
                  <Text style={[styles.ctaText, !isValid && styles.ctaTextDisabled]}>
                    {language === "hi" ? "OTP प्राप्त करें" : "Get Verification Code"}
                  </Text>
                  <View style={[styles.ctaArrow, !isValid && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <Feather name="arrow-right" size={18} color={isValid ? '#fff' : 'rgba(255,255,255,0.3)'} />
                  </View>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            {language === "hi"
              ? "जारी रखकर आप हमारी सेवा शर्तों और गोपनीयता नीति से सहमत हैं"
              : "By proceeding, you agree to our Terms of Service & Privacy Policy"}
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  orb: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  
  // Header
  header: { 
    paddingHorizontal: 24, 
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stepActive: {
    backgroundColor: '#10B981',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepInactive: {},
  stepLine: {
    width: 24,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  stepLineActive: {
    backgroundColor: 'rgba(16,185,129,0.3)',
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  topInfo: {
    gap: 16,
  },
  iconBadge: {
    marginBottom: 8,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      web: { boxShadow: '0 8px 24px rgba(16, 185, 129, 0.25)' },
      ios: {
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
    }),
  },
  title: { 
    fontSize: 32, 
    fontWeight: "900", 
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: { 
    fontSize: 15, 
    lineHeight: 24, 
    fontWeight: "500", 
    color: 'rgba(255,255,255,0.5)',
  },
  
  // Input Section
  inputSection: {
    marginTop: 40,
    gap: 10,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 2,
    marginLeft: 4,
    marginBottom: 4,
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    gap: 12,
  },
  inputCardFocused: {
    borderColor: 'rgba(16,185,129,0.4)',
    backgroundColor: 'rgba(16,185,129,0.04)',
  },
  inputCardError: {
    borderColor: 'rgba(239,68,68,0.3)',
    backgroundColor: 'rgba(239,68,68,0.04)',
  },
  countrySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flag: { fontSize: 24, includeFontPadding: false },
  countryCode: { 
    fontSize: 18, 
    fontWeight: "800", 
    color: '#fff',
    includeFontPadding: false,
  },
  separator: { 
    width: 1.5, 
    height: 28, 
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
  },
  inputArea: {
    flex: 1,
    height: 64,
    justifyContent: 'center',
  },
  phoneInput: {
    fontSize: 22,
    fontWeight: "700",
    color: '#FFFFFF',
    letterSpacing: 1,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 4,
    margin: 0,
    height: 64,
    textAlignVertical: 'center',
    includeFontPadding: false,
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
      outlineWidth: 0,
    } as any : {}),
  },
  validBadge: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
    marginTop: 2,
  },
  errorText: { 
    fontSize: 12, 
    fontWeight: "600", 
    color: '#EF4444',
  },
  helperText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.25)',
  },
  
  spacer: { flex: 1 },
  
  // Footer
  footer: { gap: 16 },
  ctaButton: {
    height: 62,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaDisabled: {
    borderColor: 'rgba(255,255,255,0.05)',
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ctaText: { 
    fontSize: 17, 
    fontWeight: "800", 
    color: "#fff",
    letterSpacing: -0.3,
  },
  ctaTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  ctaArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: { 
    fontSize: 11, 
    textAlign: "center", 
    fontWeight: '500', 
    color: 'rgba(255,255,255,0.25)',
    lineHeight: 18,
  },
});
