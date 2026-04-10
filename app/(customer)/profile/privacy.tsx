import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { GlassCard } from "@/components/ui/GlassCard";

export default function PrivacyScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const sections = [
    {
      icon: "shield-lock-outline", color: colors.primary, title: "Data Encryption",
      desc: "All your data is encrypted using AES-256 bit military-grade encryption, both in transit and at rest.",
    },
    {
      icon: "account-lock-outline", color: colors.secondary, title: "Account Security",
      desc: "Your account is secured with OTP-based authentication. We never store your password in plain text.",
    },
    {
      icon: "eye-off-outline", color: "#F59E0B", title: "Privacy Controls",
      desc: "We collect only essential data needed for app functionality. Your personal information is never shared with third parties without consent.",
    },
    {
      icon: "database-lock-outline", color: "#EF4444", title: "Data Storage",
      desc: "Your data is stored on Supabase-powered PostgreSQL databases with automatic backups and disaster recovery.",
    },
    {
      icon: "cellphone-lock", color: "#10B981", title: "Device Security",
      desc: "We use secure local storage (AsyncStorage with encryption) for sensitive data cached on your device.",
    },
    {
      icon: "delete-forever-outline", color: "#94A3B8", title: "Data Deletion",
      desc: "You can request complete deletion of your account and all associated data at any time by contacting support.",
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.secondary, "#4F46E5"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Safety</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(80)}>
          <GlassCard style={styles.topCard} intensity={15} borderRadius={28}>
            <LinearGradient colors={[colors.primary + "20", "transparent"]} style={StyleSheet.absoluteFill} />
            <MaterialCommunityIcons name="shield-check" size={40} color={colors.primary} />
            <Text style={[styles.topTitle, { color: colors.textPrimary }]}>Your Data is Safe</Text>
            <Text style={[styles.topDesc, { color: colors.textSecondary }]}>KiranaAI uses industry-standard security practices to protect your information.</Text>
          </GlassCard>
        </Animated.View>

        {sections.map((s, idx) => (
          <Animated.View key={s.title} entering={FadeInDown.delay(150 + idx * 70)}>
            <GlassCard style={styles.card} intensity={10} borderRadius={24}>
              <View style={[styles.iconBox, { backgroundColor: s.color + "15" }]}>
                <MaterialCommunityIcons name={s.icon as any} size={24} color={s.color} />
              </View>
              <View style={styles.cardText}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{s.title}</Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{s.desc}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  scroll: { padding: 16, gap: 14 },
  topCard: { alignItems: "center", padding: 28, gap: 10, overflow: "hidden" },
  topTitle: { fontSize: 22, fontWeight: "900" },
  topDesc: { fontSize: 14, fontWeight: "600", textAlign: "center", lineHeight: 22 },
  card: { flexDirection: "row", padding: 18, gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: "800" },
  cardDesc: { fontSize: 13, fontWeight: "600", lineHeight: 20 },
});
