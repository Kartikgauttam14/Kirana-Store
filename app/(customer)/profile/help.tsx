import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { GlassCard } from "@/components/ui/GlassCard";

export default function HelpScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const language = useAuthStore((s) => s.language);
  const [message, setMessage] = useState("");

  const faqs = [
    { q: "How do I place an order?", a: "Browse stores from the Home tab, select products, add them to your cart, and checkout." },
    { q: "What payment methods are supported?", a: "We support Cash on Delivery, UPI, and Card payments." },
    { q: "How can I track my order?", a: "Go to Orders tab to see real-time status of all your orders." },
    { q: "Can I cancel an order?", a: "You can cancel within 2 minutes of placing the order. Contact support for later cancellations." },
    { q: "How do referral credits work?", a: "Share your referral code. When a friend signs up and places their first order, you both earn wallet credits." },
  ];

  const [expanded, setExpanded] = useState<string | null>(null);

  const contactOptions = [
    { icon: "email-outline", label: "Email Us", value: "support@kirana-ai.com", color: colors.primary, onPress: () => Linking.openURL("mailto:support@kirana-ai.com") },
    { icon: "phone-outline", label: "Call Us", value: "+91 1800-KIRANA", color: colors.secondary, onPress: () => Linking.openURL("tel:+911800547262") },
    { icon: "chat-outline", label: "Live Chat", value: "Available 9 AM - 9 PM", color: "#F59E0B", onPress: () => Alert.alert("Live Chat", "Chat support will be available in the next update.") },
  ];

  const handleSubmit = () => {
    if (!message.trim()) return;
    Alert.alert("Sent!", "Your message has been received. We'll get back to you within 24 hours.");
    setMessage("");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#94A3B8", "#64748B"]} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === "hi" ? "सहायता केंद्र" : "Help Center"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.contactRow}>
          {contactOptions.map((c, idx) => (
            <Animated.View key={c.label} entering={FadeInDown.delay(100 + idx * 80)} style={styles.contactItem}>
              <TouchableOpacity onPress={c.onPress} activeOpacity={0.8}>
                <GlassCard style={styles.contactCard} intensity={10} borderRadius={20}>
                  <View style={[styles.contactIcon, { backgroundColor: c.color + "15" }]}>
                    <MaterialCommunityIcons name={c.icon as any} size={22} color={c.color} />
                  </View>
                  <Text style={[styles.contactLabel, { color: colors.textPrimary }]}>{c.label}</Text>
                  <Text style={[styles.contactValue, { color: colors.textSecondary }]} numberOfLines={1}>{c.value}</Text>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>FAQs</Text>
        {faqs.map((faq, idx) => (
          <Animated.View key={idx} entering={FadeInDown.delay(300 + idx * 60)}>
            <TouchableOpacity onPress={() => setExpanded(expanded === faq.q ? null : faq.q)} activeOpacity={0.8}>
              <GlassCard style={styles.faqCard} intensity={8} borderRadius={20}>
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQ, { color: colors.textPrimary }]}>{faq.q}</Text>
                  <MaterialCommunityIcons name={expanded === faq.q ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                </View>
                {expanded === faq.q && <Text style={[styles.faqA, { color: colors.textSecondary }]}>{faq.a}</Text>}
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* Contact Form */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <GlassCard style={styles.formCard} intensity={12} borderRadius={28}>
            <Text style={[styles.formTitle, { color: colors.textPrimary }]}>Still need help?</Text>
            <TextInput
              style={[styles.formInput, { color: colors.textPrimary, backgroundColor: colors.gray100, borderColor: colors.border }]}
              placeholder="Describe your issue..."
              placeholderTextColor={colors.textPlaceholder}
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity style={styles.submitWrap} onPress={handleSubmit} activeOpacity={0.9}>
              <LinearGradient colors={[colors.primary, colors.success]} style={styles.submitBtn}>
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
                <Text style={styles.submitText}>Send Message</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  contactRow: { flexDirection: "row", gap: 10 },
  contactItem: { flex: 1 },
  contactCard: { alignItems: "center", padding: 16, gap: 8 },
  contactIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 13, fontWeight: "800" },
  contactValue: { fontSize: 10, fontWeight: "600" },
  sectionTitle: { fontSize: 18, fontWeight: "900", marginTop: 4 },
  faqCard: { padding: 18, gap: 10 },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQ: { fontSize: 15, fontWeight: "800", flex: 1, paddingRight: 8 },
  faqA: { fontSize: 14, fontWeight: "600", lineHeight: 22 },
  formCard: { padding: 24, gap: 16 },
  formTitle: { fontSize: 18, fontWeight: "900" },
  formInput: { padding: 14, borderWidth: 1.5, borderRadius: 16, fontSize: 15, fontWeight: "700", minHeight: 100, textAlignVertical: "top" },
  submitWrap: { borderRadius: 16, overflow: "hidden" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 16 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "900" },
});
