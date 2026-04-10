import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Share, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";

export default function ReferralScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.language);

  const referralCode = "KIRANA2026";
  const rewards = [
    { icon: "account-plus-outline", title: "Invite Friends", desc: "Share your code with family & friends", color: colors.primary },
    { icon: "gift-outline", title: "They Get ₹50", desc: "Your friend gets ₹50 wallet credit on signup", color: "#F59E0B" },
    { icon: "cash-multiple", title: "You Get ₹100", desc: "You earn ₹100 when they place their first order", color: colors.secondary },
  ];

  const handleShare = async () => {
    await Share.share({
      message: `🛒 Join KiranaAI - Your AI-powered grocery companion!\n\nUse my referral code: ${referralCode}\n\nGet ₹50 wallet credit on signup!\n\nDownload now: https://kirana-ai.com`,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.primary, "#059669"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === "hi" ? "रेफ़र और कमाएं" : "Refer & Earn"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.codeCard} intensity={15} borderRadius={28}>
            <MaterialCommunityIcons name="ticket-percent-outline" size={40} color={colors.primary} />
            <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Your Referral Code</Text>
            <View style={[styles.codeBox, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
              <Text style={[styles.codeText, { color: colors.primary }]}>{referralCode}</Text>
            </View>
            <TouchableOpacity style={styles.shareWrap} onPress={handleShare} activeOpacity={0.9}>
              <LinearGradient colors={[colors.primary, "#059669"]} style={styles.shareBtn}>
                <MaterialCommunityIcons name="share-variant-outline" size={20} color="#fff" />
                <Text style={styles.shareText}>{language === "hi" ? "दोस्तों को शेयर करें" : "Share with Friends"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{language === "hi" ? "कैसे काम करता है" : "How it Works"}</Text>

        {rewards.map((r, idx) => (
          <Animated.View key={r.title} entering={FadeInDown.delay(200 + idx * 100)}>
            <GlassCard style={styles.stepCard} intensity={10} borderRadius={24}>
              <View style={styles.stepNum}><Text style={styles.stepNumText}>{idx + 1}</Text></View>
              <View style={[styles.stepIcon, { backgroundColor: r.color + "15" }]}>
                <MaterialCommunityIcons name={r.icon as any} size={24} color={r.color} />
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{r.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>{r.desc}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(500)}>
          <GlassCard style={styles.statsCard} intensity={10} borderRadius={28}>
            <Text style={[styles.statsTitle, { color: colors.textPrimary }]}>Your Stats</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.primary }]}>3</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Referrals</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: "#F59E0B" }]}>₹300</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Earned</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: colors.secondary }]}>5</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },
  scroll: { padding: 16, gap: 16 },
  codeCard: { alignItems: "center", padding: 28, gap: 14 },
  codeLabel: { fontSize: 14, fontWeight: "700" },
  codeBox: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, borderWidth: 2, borderStyle: "dashed" },
  codeText: { fontSize: 26, fontWeight: "900", letterSpacing: 3 },
  shareWrap: { borderRadius: 20, overflow: "hidden", width: "100%", marginTop: 6 },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16 },
  shareText: { color: "#fff", fontSize: 16, fontWeight: "900" },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  stepCard: { flexDirection: "row", alignItems: "center", padding: 18, gap: 14 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  stepNumText: { color: "#94A3B8", fontSize: 13, fontWeight: "900" },
  stepIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  stepText: { flex: 1, gap: 4 },
  stepTitle: { fontSize: 16, fontWeight: "800" },
  stepDesc: { fontSize: 13, fontWeight: "600" },
  statsCard: { padding: 24, gap: 16 },
  statsTitle: { fontSize: 18, fontWeight: "900", textAlign: "center" },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statNum: { fontSize: 28, fontWeight: "900" },
  statLabel: { fontSize: 12, fontWeight: "700" },
  statDivider: { width: 1, height: 40 },
});
