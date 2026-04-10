import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Platform,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { Bill } from "@/types/billing.types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateTime } from "@/utils/formatDate";

export default function BillingHistoryScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, getBillsForStore } = useData();

  const bills = useMemo(
    () => getBillsForStore(activeStore?.id ?? "").sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    [activeStore?.id, getBillsForStore]
  );

  const totalRevenue = bills.reduce((s, b) => s + b.grandTotal, 0);

  const shareBill = async (bill: Bill) => {
    const itemsText = bill.items
      .map((i) => `${i.productName}: ${i.quantity} × ₹${i.unitPrice} = ₹${(i.totalPrice || 0).toFixed(0)}`)
      .join("\n");

    const message = `*${activeStore?.name ?? "KiranaAI"}*\nBill #${bill.billNumber}\n${formatDateTime(bill.createdAt)}\n\n${itemsText}\n\nSubtotal: ₹${bill.subtotal.toFixed(0)}\nGST: ₹${bill.gstTotal.toFixed(0)}\n*Total: ₹${bill.grandTotal.toFixed(0)}*\n\nPayment: ${bill.paymentMode} | ${bill.isPaid ? "PAID" : "CREDIT"}`;

    Share.share({ message });
  };

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Bill History</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={[styles.summaryBar, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{bills.length}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Bills</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatCurrency(totalRevenue)}</Text>
          <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Revenue</Text>
        </View>
      </View>

      <FlatList
        data={bills}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.billCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.billHeader}>
              <View>
                <Text style={[styles.billNumber, { color: colors.textPrimary }]}>#{item.billNumber}</Text>
                <Text style={[styles.billTime, { color: colors.textSecondary }]}>
                  {formatDateTime(item.createdAt)}
                </Text>
              </View>
              <View style={styles.billRight}>
                <Text style={[styles.billTotal, { color: colors.primary }]}>
                  {formatCurrency(item.grandTotal)}
                </Text>
                <Badge
                  label={item.isPaid ? item.paymentMode : "CREDIT"}
                  variant={item.isPaid ? "success" : "danger"}
                  size="sm"
                />
              </View>
            </View>
            {item.customerName && (
              <Text style={[styles.customer, { color: colors.textSecondary }]}>
                <Feather name="user" size={12} /> {item.customerName}
                {item.customerPhone ? ` · ${item.customerPhone}` : ""}
              </Text>
            )}
            <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
              {item.items.length} item{item.items.length !== 1 ? "s" : ""}
            </Text>
            <TouchableOpacity
              style={[styles.shareBtn, { borderColor: colors.primary }]}
              onPress={() => shareBill(item)}
            >
              <Feather name="share-2" size={14} color={colors.primary} />
              <Text style={[styles.shareText, { color: colors.primary }]}>Share Bill</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListEmptyComponent={
          <EmptyState icon="file-text" title="No bills yet" subtitle="Create your first bill from the Billing screen" />
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
  title: { fontSize: 20, fontWeight: "700" },
  summaryBar: {
    flexDirection: "row",
    margin: 16,
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  summaryItem: { flex: 1, alignItems: "center", padding: 16 },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { fontSize: 12, marginTop: 2 },
  summaryDivider: { width: 1 },
  list: { padding: 16, gap: 12 },
  billCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  billHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  billNumber: { fontSize: 16, fontWeight: "700" },
  billTime: { fontSize: 12, marginTop: 2 },
  billRight: { alignItems: "flex-end", gap: 4 },
  billTotal: { fontSize: 18, fontWeight: "800" },
  customer: { fontSize: 13 },
  itemCount: { fontSize: 13 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: "flex-start",
  },
  shareText: { fontSize: 13, fontWeight: "600" },
});
