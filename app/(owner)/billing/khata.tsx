import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { BlurView } from "expo-blur";

import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { GlassCard } from "@/components/ui/GlassCard";

export default function KhataScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore } = useData();
  const language = useAuthStore((s) => s.language);

  const creditBills = useMemo(
    () =>
      getBillsForStore(activeStore?.id ?? "")
        .filter((b) => !b.isPaid || b.paymentMode === "CREDIT")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activeStore?.id, getBillsForStore]
  );

  const totalCredit = creditBills.reduce((s, b) => s + b.grandTotal, 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* Premium Header */}
      <BlurView
        intensity={80}
        tint="extraLight"
        style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 0) }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
             <Text style={[styles.subtitle, { color: colors.primary }]}>
               {language === 'hi' ? "उधार खाता" : "Credit Ledger"}
             </Text>
             <Text style={[styles.title, { color: colors.textPrimary }]}>
               {language === 'hi' ? "खाता बुक" : "Khata Book"}
             </Text>
          </View>
          <View style={[styles.iconBox, { backgroundColor: colors.danger + '10' }]}>
             <MaterialCommunityIcons name="book-open-variant" size={24} color={colors.danger} />
          </View>
        </View>
      </BlurView>

      <FlatList
        data={creditBills}
        keyExtractor={(b) => b.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={
          <Animated.View entering={FadeInDown.delay(100)}>
            <GlassCard style={styles.totalCard} intensity={30} borderRadius={32}>
              <LinearGradient
                colors={[colors.danger + '15', colors.accent + '10']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.totalGradient}
              />
              <View style={styles.totalHeader}>
                <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>
                  {language === 'hi' ? "कुल बकाया राशि" : "Total Outstanding"}
                </Text>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.danger} />
              </View>
              <Text style={[styles.totalValue, { color: colors.danger }]}>
                {formatCurrency(totalCredit)}
              </Text>
              <View style={styles.totalFooter}>
                 <Text style={[styles.footerText, { color: colors.textPlaceholder }]}>
                   {language === 'hi' ? `${creditBills.length} पेंडिंग बिल` : `${creditBills.length} pending bills`}
                 </Text>
              </View>
            </GlassCard>
            <Text style={[styles.listTitle, { color: colors.textPrimary }]}>
               {language === 'hi' ? "लेनदेन का इतिहास" : "Transaction History"}
            </Text>
          </Animated.View>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(200 + index * 50)}>
            <GlassCard style={styles.card} intensity={15} borderRadius={24}>
              <View style={styles.cardLeft}>
                <View style={[styles.customerInitial, { backgroundColor: colors.gray100 }]}>
                   <Text style={[styles.initialText, { color: colors.textPrimary }]}>
                     {item.customerName?.slice(0, 1).toUpperCase() ?? "U"}
                   </Text>
                </View>
                <View style={styles.billInfo}>
                   <Text style={[styles.customerName, { color: colors.textPrimary }]} numberOfLines={1}>
                     {item.customerName || (language === 'hi' ? "अज्ञात ग्राहक" : "Unknown Customer")}
                   </Text>
                   <Text style={[styles.billNum, { color: colors.textPlaceholder }]}>
                     Bill #{item.billNumber} • {formatDate(item.createdAt)}
                   </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.amount, { color: colors.danger }]}>
                  +{formatCurrency(item.grandTotal)}
                </Text>
                <TouchableOpacity 
                  style={[styles.settleBtn, { backgroundColor: colors.primary + '10' }]}
                  activeOpacity={0.7}
                >
                   <Text style={[styles.settleText, { color: colors.primary }]}>
                     {language === 'hi' ? "चुकता करें" : "Settle"}
                   </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        )}
        ListEmptyComponent={
          <EmptyState 
            icon="book-check-outline" 
            title={language === 'hi' ? "कोई बकाया नहीं" : "No Pending Dues"} 
            subtitle={language === 'hi' ? "आपका सारा हिसाब बराबर है!" : "All your credit bills are settled."} 
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    zIndex: 10,
    ...Platform.select({
      android: { elevation: 8 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
      }
    })
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.02)' },
  headerInfo: { flex: 1 },
  subtitle: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingTop: 24 },
  totalCard: { padding: 24, gap: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.1)' },
  totalGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  totalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalValue: { fontSize: 36, fontWeight: "900", letterSpacing: -1 },
  totalFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  footerText: { fontSize: 12, fontWeight: '700' },
  listTitle: { fontSize: 18, fontWeight: '900', marginTop: 32, marginBottom: 16, paddingHorizontal: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  customerInitial: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  initialText: { fontSize: 18, fontWeight: '900' },
  billInfo: { flex: 1, gap: 2 },
  customerName: { fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  billNum: { fontSize: 12, fontWeight: '700' },
  cardRight: { alignItems: "flex-end", gap: 8 },
  amount: { fontSize: 18, fontWeight: "900" },
  settleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  settleText: { fontSize: 12, fontWeight: '800' },
});

