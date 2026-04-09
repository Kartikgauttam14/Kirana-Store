import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export default function KhataScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore } = useData();

  const creditBills = useMemo(
    () =>
      getBillsForStore(activeStore?.id ?? "")
        .filter((b) => !b.isPaid || b.paymentMode === "CREDIT")
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [activeStore?.id, getBillsForStore]
  );

  const totalCredit = creditBills.reduce((s, b) => s + b.grandTotal, 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Khata (Credit Book)</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.totalCard, { backgroundColor: colors.dangerLight, borderColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Outstanding</Text>
        <Text style={[styles.totalValue, { color: colors.danger }]}>{formatCurrency(totalCredit)}</Text>
      </View>

      <FlatList
        data={creditBills}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View>
                <Text style={[styles.billNum, { color: colors.textPrimary }]}>Bill #{item.billNumber}</Text>
                {item.customerName && (
                  <Text style={[styles.customer, { color: colors.textSecondary }]}>
                    {item.customerName}
                    {item.customerPhone ? ` · ${item.customerPhone}` : ""}
                  </Text>
                )}
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.amount, { color: colors.danger }]}>
                  {formatCurrency(item.grandTotal)}
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListEmptyComponent={
          <EmptyState icon="book" title="No credit bills" subtitle="All bills are settled" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700" },
  totalCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  totalLabel: { fontSize: 14 },
  totalValue: { fontSize: 28, fontWeight: "800" },
  list: { padding: 16, gap: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  billNum: { fontSize: 15, fontWeight: "700" },
  customer: { fontSize: 13, marginTop: 3 },
  cardRight: { alignItems: "flex-end" },
  amount: { fontSize: 18, fontWeight: "800" },
  date: { fontSize: 12, marginTop: 2 },
});
