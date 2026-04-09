import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function StoreHeader() {
  const colors = useColors();
  const router = useRouter();
  const { stores, activeStore, setActiveStore } = useData();
  const insets = useSafeAreaInsets();
  const [showSwitcher, setShowSwitcher] = useState(false);

  return (
    <>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            paddingTop: insets.top + (Platform.OS === "web" ? 12 : 8),
          },
        ]}
      >
        <View style={styles.left}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <BrandLogo size={24} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>KiranaAI</Text>
        </View>

        <View style={styles.right}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.dangerLight }]}
            onPress={() => {
              Alert.alert("Logout", "Are you sure you want to logout?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Logout",
                  style: "destructive",
                  onPress: () => {
                    useAuthStore.getState().logout();
                  },
                },
              ]);
            }}
          >
            <Feather name="log-out" size={16} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.storePicker, { backgroundColor: colors.muted }]}
            onPress={() => setShowSwitcher(true)}
            activeOpacity={0.7}
          >
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.storeName, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeStore?.name ?? "Select Store"}
            </Text>
            <Feather name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showSwitcher} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setShowSwitcher(false)}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 },
            ]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              Select Active Store
            </Text>
            <View style={styles.storeList}>
              {stores.map((store) => (
                <TouchableOpacity
                  key={store.id}
                  style={[
                    styles.storeRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: activeStore?.id === store.id ? colors.primary : colors.border,
                      borderWidth: activeStore?.id === store.id ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    setActiveStore(store);
                    setShowSwitcher(false);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.storeIcon, { backgroundColor: activeStore?.id === store.id ? colors.primaryLight : colors.muted }]}>
                    <Feather name="home" size={18} color={activeStore?.id === store.id ? colors.primary : colors.textSecondary} />
                  </View>
                  <View style={styles.storeInfo}>
                    <Text style={[styles.storeRowName, { color: colors.textPrimary }]}>
                      {store.name}
                    </Text>
                    <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>
                      {store.city}
                    </Text>
                  </View>
                  {activeStore?.id === store.id && (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Feather name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      web: {
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        zIndex: 100,
      }
    })
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-5deg" }],
  },
  appName: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  storePicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    maxWidth: 200,
  },
  storeName: { fontSize: 13, fontWeight: "700", flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      }
    })
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8, textAlign: "center" },
  storeList: { gap: 12 },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 20,
  },
  storeIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  storeInfo: { flex: 1 },
  storeRowName: { fontSize: 16, fontWeight: "700" },
  storeAddress: { fontSize: 13, marginTop: 2 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
