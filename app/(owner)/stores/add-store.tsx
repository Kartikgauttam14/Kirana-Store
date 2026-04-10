import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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
import { useData } from "@/context/DataContext";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";
import { Store } from "@/types/store.types";

export default function AddStoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addStore, setActiveStore } = useData();
  const language = useAuthStore((s) => s.language);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    gstNumber: "",
    fssaiNumber: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    if (!form.name || !form.phone || !form.city) {
      Alert.alert(
        language === "hi" ? "आवश्यक" : "Required",
        language === "hi"
          ? "दुकान का नाम, फ़ोन और शहर आवश्यक हैं"
          : "Store name, phone, and city are required"
      );
      return;
    }

    const newStore: Store = {
      id: `store_${Date.now()}`,
      ownerId: "owner_1",
      name: form.name,
      phone: form.phone,
      address: form.address || "",
      city: form.city,
      pincode: form.pincode || "",
      gstNumber: form.gstNumber || "",
      fssaiNumber: form.fssaiNumber || "",
      latitude: 28.6139,
      longitude: 77.209,
      deliveryRadius: 3,
      minOrderValue: 100,
      openTime: "08:00",
      closeTime: "22:00",
      isOpen: true,
      isActive: true,
      rating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addStore(newStore);
    setActiveStore(newStore);
    Alert.alert(
      language === "hi" ? "सफल!" : "Success!",
      language === "hi"
        ? `${form.name} सफलतापूर्वक पंजीकृत हो गया।`
        : `${form.name} has been registered successfully.`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const fields = [
    { key: "name", label: language === "hi" ? "दुकान का नाम *" : "Store Name *", icon: "storefront-outline", placeholder: "e.g. Sharma General Store" },
    { key: "phone", label: language === "hi" ? "फ़ोन नंबर *" : "Phone Number *", icon: "phone-outline", placeholder: "10-digit mobile", keyboard: "phone-pad" as const, maxLength: 10 },
    { key: "address", label: language === "hi" ? "पता" : "Address", icon: "map-marker-outline", placeholder: "Shop No., Street, Area" },
    { key: "city", label: language === "hi" ? "शहर *" : "City *", icon: "city-variant-outline", placeholder: "e.g. New Delhi" },
    { key: "pincode", label: language === "hi" ? "पिन कोड" : "Pincode", icon: "mailbox-outline", placeholder: "6-digit code", keyboard: "numeric" as const, maxLength: 6 },
    { key: "gstNumber", label: "GST Number", icon: "file-document-outline", placeholder: "Optional" },
    { key: "fssaiNumber", label: "FSSAI Number", icon: "shield-check-outline", placeholder: "Optional" },
  ];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.success]}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {language === "hi" ? "नई दुकान जोड़ें" : "Register New Store"}
          </Text>
          <Text style={styles.headerSub}>
            {language === "hi" ? "व्यापार विवरण भरें" : "Fill in your business details"}
          </Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field, idx) => (
          <Animated.View key={field.key} entering={FadeInDown.delay(100 + idx * 60)}>
            <GlassCard style={styles.fieldCard} intensity={10} borderRadius={24}>
              <View style={styles.fieldHeader}>
                <MaterialCommunityIcons name={field.icon as any} size={18} color={colors.primary} />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{field.label}</Text>
              </View>
              <TextInput
                style={[styles.fieldInput, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.gray100 }]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.textPlaceholder}
                value={(form as any)[field.key]}
                onChangeText={(v) => update(field.key, v)}
                keyboardType={(field as any).keyboard || "default"}
                maxLength={(field as any).maxLength}
              />
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(600)}>
          <TouchableOpacity style={styles.saveBtnWrap} onPress={handleSave} activeOpacity={0.9}>
            <LinearGradient colors={[colors.primary, colors.success]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveBtn}>
              <MaterialCommunityIcons name="storefront-outline" size={22} color="#fff" />
              <Text style={styles.saveBtnText}>
                {language === "hi" ? "दुकान पंजीकृत करें" : "Register Store"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  backBtn: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  headerCenter: { alignItems: "center", flex: 1 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700", marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  fieldCard: { padding: 16, gap: 10 },
  fieldHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  fieldInput: { fontSize: 16, fontWeight: "700", padding: 14, borderWidth: 1.5, borderRadius: 16 },
  saveBtnWrap: { borderRadius: 24, overflow: "hidden", marginTop: 12, elevation: 8, shadowColor: "#10B981", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15 },
  saveBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, padding: 20 },
  saveBtnText: { color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 0.5 },
});
