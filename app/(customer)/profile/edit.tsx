import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";

export default function EditProfileScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const language = useAuthStore((s) => s.language);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: "",
  });

  const handleSave = () => {
    if (!form.name || !form.phone) {
      Alert.alert(language === 'hi' ? "त्रुटि" : "Error", language === 'hi' ? "कृपया नाम और फ़ोन नंबर दर्ज करें।" : "Please enter your name and phone number.");
      return;
    }
    Alert.alert(
      language === 'hi' ? "अपडेट किया गया" : "Updated",
      language === 'hi' ? "प्रोफाइल सफलतापूर्वक अपडेट की गई।" : "Profile updated successfully.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[colors.primary, "#059669"]} style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'web' ? 20 : 12) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'hi' ? "प्रोफाइल बदलें" : "Edit Profile"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.avatarSection}>
          <LinearGradient
            colors={[colors.primary, '#059669']}
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{form.name.slice(0, 1).toUpperCase() || "U"}</Text>
          </LinearGradient>
          <TouchableOpacity style={[styles.editAvatarBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="camera-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <GlassCard style={styles.formCard} intensity={15} borderRadius={24}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'hi' ? "पूरा नाम" : "Full Name"}</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholder="Enter your name"
                placeholderTextColor={colors.textPlaceholder}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'hi' ? "फ़ोन नंबर" : "Phone Number"}</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]}
                value={form.phone}
                onChangeText={(t) => setForm({ ...form, phone: t })}
                placeholder="Enter phone number"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{language === 'hi' ? "ईमेल" : "Email Address"}</Text>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]}
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                placeholder="Optional"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <TouchableOpacity style={styles.saveWrap} onPress={handleSave} activeOpacity={0.9}>
            <LinearGradient colors={[colors.primary, colors.success]} style={styles.saveBtn}>
              <Text style={styles.saveText}>{language === 'hi' ? "सेव करें" : "Save Changes"}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
  scroll: { padding: 16, gap: 24 },
  avatarSection: { alignItems: "center", marginTop: 10 },
  avatarGradient: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 40, fontWeight: "900", color: "#fff" },
  editAvatarBtn: { position: "absolute", bottom: -5, right: "35%", width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", borderWidth: 2 },
  formCard: { padding: 20, gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  input: { padding: 16, borderWidth: 1.5, borderRadius: 16, fontSize: 16, fontWeight: "700" },
  saveWrap: { borderRadius: 16, overflow: "hidden" },
  saveBtn: { alignItems: "center", justifyContent: "center", padding: 18 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
