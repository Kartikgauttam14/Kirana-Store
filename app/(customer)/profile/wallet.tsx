import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/formatCurrency";

export default function WalletScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.language);

  const transactions = [
    { id: "1", type: "credit", label: "Cashback on Order #KA4521", amount: 25, date: "Today, 2:30 PM" },
    { id: "2", type: "debit", label: "Used on Order #KA4498", amount: 50, date: "Yesterday, 11:15 AM" },
    { id: "3", type: "credit", label: "Referral Bonus", amount: 100, date: "8 Apr, 6:00 PM" },
    { id: "4", type: "credit", label: "Welcome Bonus", amount: 50, date: "5 Apr, 10:00 AM" },
  ];

  const balance = transactions.reduce((s, t) => s + (t.type === "credit" ? t.amount : -t.amount), 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === "hi" ? "किराना वॉलेट" : "Kirana Wallet"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)}>
          <LinearGradient colors={["#F59E0B", "#D97706", "#B45309"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <View style={styles.balanceTop}>
              <MaterialCommunityIcons name="wallet-outline" size={28} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity style={styles.balanceBtn}>
                <MaterialCommunityIcons name="plus" size={18} color="#F59E0B" />
                <Text style={styles.balanceBtnText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.balanceBtn}>
                <MaterialCommunityIcons name="send" size={18} color="#F59E0B" />
                <Text style={styles.balanceBtnText}>Transfer</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Transaction History</Text>

        {transactions.map((tx, idx) => (
          <Animated.View key={tx.id} entering={FadeInDown.delay(200 + idx * 80)}>
            <GlassCard style={styles.txCard} intensity={10} borderRadius={20}>
              <View style={[styles.txIcon, { backgroundColor: (tx.type === "credit" ? colors.success : colors.danger) + "15" }]}>
                <MaterialCommunityIcons name={tx.type === "credit" ? "arrow-down-circle" : "arrow-up-circle"} size={24} color={tx.type === "credit" ? colors.success : colors.danger} />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txLabel, { color: colors.textPrimary }]}>{tx.label}</Text>
                <Text style={[styles.txDate, { color: colors.textPlaceholder }]}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.type === "credit" ? colors.success : colors.danger }]}>
                {tx.type === "credit" ? "+" : "-"}{formatCurrency(tx.amount)}
              </Text>
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
  scroll: { padding: 16, gap: 16 },
  balanceCard: { borderRadius: 28, padding: 28, gap: 16, elevation: 8, shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 },
  balanceTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  balanceLabel: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: "700" },
  balanceAmount: { color: "#fff", fontSize: 42, fontWeight: "900", letterSpacing: -1 },
  balanceActions: { flexDirection: "row", gap: 12, marginTop: 4 },
  balanceBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.95)", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 14 },
  balanceBtnText: { fontSize: 13, fontWeight: "800", color: "#B45309" },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginTop: 8 },
  txCard: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  txIcon: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1, gap: 4 },
  txLabel: { fontSize: 14, fontWeight: "800" },
  txDate: { fontSize: 12, fontWeight: "600" },
  txAmount: { fontSize: 17, fontWeight: "900" },
});
