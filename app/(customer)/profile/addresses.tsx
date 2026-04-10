import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";

interface Address {
  id: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.language);

  const [addresses, setAddresses] = useState<Address[]>([
    { id: "1", label: "Home", address: "123, Main Market, Block A, Sector 15, New Delhi - 110001", isDefault: true },
    { id: "2", label: "Office", address: "Tower B, Floor 4, Connaught Place, New Delhi - 110001", isDefault: false },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const handleAdd = () => {
    if (!newLabel || !newAddress) {
      Alert.alert("Required", "Please enter label and address");
      return;
    }
    setAddresses((prev) => [...prev, { id: `addr_${Date.now()}`, label: newLabel, address: newAddress, isDefault: false }]);
    setNewLabel("");
    setNewAddress("");
    setShowAdd(false);
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const iconMap: Record<string, string> = { Home: "home-outline", Office: "office-building-outline" };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.secondary, "#4F46E5"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === "hi" ? "मेरे पते" : "Saved Addresses"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {addresses.map((addr, idx) => (
          <Animated.View key={addr.id} entering={FadeInDown.delay(100 + idx * 80)}>
            <GlassCard style={styles.card} intensity={12} borderRadius={24}>
              <View style={styles.cardRow}>
                <View style={[styles.iconBox, { backgroundColor: colors.secondary + "20" }]}>
                  <MaterialCommunityIcons name={(iconMap[addr.label] || "map-marker-outline") as any} size={22} color={colors.secondary} />
                </View>
                <View style={styles.cardText}>
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.textPrimary }]}>{addr.label}</Text>
                    {addr.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary + "20" }]}>
                        <Text style={[styles.defaultText, { color: colors.primary }]}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addrText, { color: colors.textSecondary }]}>{addr.address}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {!addr.isDefault && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary + "15" }]} onPress={() => setDefault(addr.id)}>
                    <Text style={[styles.actionText, { color: colors.primary }]}>Set Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.danger + "15" }]} onPress={() => deleteAddress(addr.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        {showAdd ? (
          <Animated.View entering={FadeInDown}>
            <GlassCard style={styles.card} intensity={12} borderRadius={24}>
              <Text style={[styles.addTitle, { color: colors.primary }]}>New Address</Text>
              <TextInput style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]} placeholder="Label (e.g. Home, Office)" placeholderTextColor={colors.textPlaceholder} value={newLabel} onChangeText={setNewLabel} />
              <TextInput style={[styles.input, styles.multiline, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]} placeholder="Full address with pincode" placeholderTextColor={colors.textPlaceholder} value={newAddress} onChangeText={setNewAddress} multiline />
              <View style={styles.addActions}>
                <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowAdd(false)}>
                  <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveWrap} onPress={handleAdd}>
                  <LinearGradient colors={[colors.secondary, "#4F46E5"]} style={styles.saveBtn}>
                    <Text style={styles.saveText}>Save Address</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        ) : (
          <TouchableOpacity style={[styles.addNewBtn, { borderColor: colors.secondary + "40" }]} onPress={() => setShowAdd(true)}>
            <MaterialCommunityIcons name="plus" size={20} color={colors.secondary} />
            <Text style={[styles.addNewText, { color: colors.secondary }]}>Add New Address</Text>
          </TouchableOpacity>
        )}
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
  card: { padding: 20, gap: 14 },
  cardRow: { flexDirection: "row", gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1, gap: 6 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontSize: 17, fontWeight: "900" },
  defaultBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  defaultText: { fontSize: 11, fontWeight: "800" },
  addrText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  actions: { flexDirection: "row", gap: 10 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: { fontSize: 13, fontWeight: "800" },
  addTitle: { fontSize: 18, fontWeight: "900" },
  input: { padding: 14, borderWidth: 1.5, borderRadius: 16, fontSize: 15, fontWeight: "700" },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  addActions: { flexDirection: "row", gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, alignItems: "center" },
  cancelText: { fontSize: 15, fontWeight: "800" },
  saveWrap: { flex: 1, borderRadius: 16, overflow: "hidden" },
  saveBtn: { paddingVertical: 14, alignItems: "center" },
  saveText: { color: "#fff", fontSize: 15, fontWeight: "900" },
  addNewBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 18, borderRadius: 20, borderWidth: 2, borderStyle: "dashed" },
  addNewText: { fontSize: 16, fontWeight: "800" },
});
