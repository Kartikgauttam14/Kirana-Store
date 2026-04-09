import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "@/store/authStore";
import { useColors } from "@/hooks/useColors";

export default function ProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  };

  const menuItems: Array<{
    icon: keyof typeof Feather.glyphMap;
    label: string;
    onPress?: () => void;
  }> = [
    { icon: "map-pin", label: "My Addresses" },
    { icon: "package", label: "My Orders", onPress: () => router.push("/(customer)/orders/index" as any) },
    { icon: "help-circle", label: "Help & Support" },
    { icon: "info", label: "About KiranaAI" },
  ];

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) },
      ]}
    >
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}>
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.slice(0, 1).toUpperCase() ?? "U"}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name ?? "Customer"}</Text>
          <Text style={styles.userPhone}>+91 {user?.phone ?? "XXXXXXXXXX"}</Text>
        </View>

        <View style={[styles.langCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.langTitle, { color: colors.textPrimary }]}>Language / भाषा</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[
                styles.langBtn,
                { backgroundColor: language === "en" ? colors.primary : colors.muted },
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text style={[styles.langBtnText, { color: language === "en" ? "#fff" : colors.mutedForeground }]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.langBtn,
                { backgroundColor: language === "hi" ? colors.primary : colors.muted },
              ]}
              onPress={() => setLanguage("hi")}
            >
              <Text style={[styles.langBtnText, { color: language === "hi" ? "#fff" : colors.mutedForeground }]}>
                हिंदी
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.menu, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.menuItem,
                i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
                <Feather name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: colors.danger }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: "800" },
  scroll: { gap: 16, padding: 16 },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#fff" },
  userName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  userPhone: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  langCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  langTitle: { fontSize: 15, fontWeight: "600" },
  langRow: { flexDirection: "row", gap: 10 },
  langBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  langBtnText: { fontWeight: "600", fontSize: 15 },
  menu: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
  },
  logoutText: { fontSize: 16, fontWeight: "700" },
});
