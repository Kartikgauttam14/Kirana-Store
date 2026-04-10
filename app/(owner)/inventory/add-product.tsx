import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { useData } from "@/context/DataContext";
import { useColors } from "@/hooks/useColors";
import { useAuthStore } from "@/store/authStore";
import { PRODUCT_CATEGORIES, UNITS, GST_RATES } from "@/constants/categories";
import { Product } from "@/types/inventory.types";
import { GlassCard } from "@/components/ui/GlassCard";

type Step = 1 | 2 | 3 | 4;

export default function AddProductScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { activeStore, addProduct } = useData();
  const language = useAuthStore((s) => s.language);
  const [step, setStep] = useState<Step>(1);

  const [form, setForm] = useState({
    name: "",
    nameHindi: "",
    category: PRODUCT_CATEGORIES[0].id,
    unit: UNITS[0].id,
    barcode: "",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    reorderLevel: "10",
    reorderQty: "20",
    gstRate: "5",
    hsnCode: "",
    supplierName: "",
    supplierPhone: "",
  });

  const update = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const margin =
    form.costPrice && form.sellingPrice
      ? (
          ((parseFloat(form.sellingPrice) || 0) - (parseFloat(form.costPrice) || 0)) /
          (parseFloat(form.costPrice) || 1) *
          100
        ).toFixed(1)
      : "0.0";

  const handleSave = () => {
    if (!form.name || !form.costPrice || !form.sellingPrice || !form.currentStock) {
      Alert.alert(
        language === 'hi' ? "आवश्यक फ़ील्ड" : "Required Fields", 
        language === 'hi' ? "कृपया सभी आवश्यक फ़ील्ड भरें" : "Please fill all required fields"
      );
      return;
    }
    const sku = `${form.category.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const product: Product = {
      id: `prod_${Date.now()}`,
      storeId: activeStore?.id ?? "",
      name: form.name,
      nameHindi: form.nameHindi || undefined,
      category: form.category,
      sku,
      barcode: form.barcode || undefined,
      unit: form.unit,
      costPrice: parseFloat(form.costPrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      currentStock: parseFloat(form.currentStock) || 0,
      reorderLevel: parseFloat(form.reorderLevel) || 10,
      reorderQty: parseFloat(form.reorderQty) || 20,
      gstRate: parseFloat(form.gstRate) || 5,
      hsnCode: form.hsnCode || undefined,
      supplierName: form.supplierName || undefined,
      supplierPhone: form.supplierPhone || undefined,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addProduct(product);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      language === 'hi' ? "आइटम जोड़ा गया!" : "Item Added!", 
      language === 'hi' ? "उत्पाद सफलतापूर्वक आपके कैटलॉग में जोड़ दिया गया है।" : "Product has been successfully added to your catalog.",
      [{ text: language === 'hi' ? "ठीक है" : "Done", onPress: () => router.back() }]
    );
  };

  const stepTitles = language === 'hi' 
    ? ["मूल जानकारी", "मूल्य निर्धारण और स्टॉक", "जीएसटी और टैक्स", "सप्लायर विवरण"]
    : ["Basic Information", "Pricing & Stock", "GST & Tax Info", "Supplier Details"];

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 0) }]}>
         <TouchableOpacity 
           onPress={() => (step === 1 ? router.back() : setStep((s) => (s - 1) as Step))}
           style={styles.backBtn}
         >
           <Feather name="chevron-left" size={24} color={colors.textPrimary} />
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
              {language === 'hi' ? "नया उत्पाद जोड़ें" : "Add New Product"}
            </Text>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{stepTitles[step-1]}</Text>
         </View>
         <View style={styles.stepIndicator}>
            <Text style={[styles.stepText, { color: colors.primary }]}>{step}<Text style={{color: colors.textPlaceholder}}>/4</Text></Text>
         </View>
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4].map((s) => (
          <View
            key={s}
            style={[
              styles.progressSegment,
              { backgroundColor: s <= step ? colors.primary : colors.gray300, flex: 1 }
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={[styles.form, { paddingBottom: insets.bottom + 120 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View key={step} entering={FadeInRight.duration(300)}>
          <GlassCard intensity={15} borderRadius={32} style={styles.stepCard}>
             {step === 1 && (
              <View style={styles.fields}>
                <InputField label={language === 'hi' ? "उत्पाद का नाम *" : "Product Name *"} value={form.name} onChangeText={(v) => update("name", v)} placeholder="e.g. Organic Basmati Rice" colors={colors} icon="package-variant-closed" />
                <InputField label={language === 'hi' ? "स्थानीय भाषा का नाम" : "Local Language Name"} value={form.nameHindi} onChangeText={(v) => update("nameHindi", v)} placeholder="उदा. बासमती चावल" colors={colors} icon="translate" />
                
                <View style={styles.group}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {language === 'hi' ? "श्रेणी" : "Category"}
                  </Text>
                  <View style={styles.chipGrid}>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: form.category === cat.id ? colors.primary : colors.gray100,
                            borderColor: form.category === cat.id ? colors.primary : 'transparent',
                          },
                        ]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); update("category", cat.id); }}
                      >
                        <Text style={[styles.chipText, { color: form.category === cat.id ? "#fff" : colors.textPrimary }]}>
                          {language === 'hi' ? cat.labelHindi || cat.label : cat.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.group}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {language === 'hi' ? "माप की इकाई" : "Unit of Measurement"}
                  </Text>
                  <View style={styles.chipGrid}>
                    {UNITS.map((u) => (
                      <TouchableOpacity
                        key={u.id}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: form.unit === u.id ? colors.primary : colors.gray100,
                            borderColor: form.unit === u.id ? colors.primary : 'transparent',
                          },
                        ]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); update("unit", u.id); }}
                      >
                        <Text style={[styles.chipText, { color: form.unit === u.id ? "#fff" : colors.textPrimary }]}>
                          {u.id}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <InputField label={language === 'hi' ? "बारकोड / EAN" : "Barcode / EAN"} value={form.barcode} onChangeText={(v) => update("barcode", v)} placeholder="Scan or enter manually" colors={colors} icon="barcode-scan" keyboardType="numeric" />
              </View>
            )}

            {step === 2 && (
              <View style={styles.fields}>
                <View style={styles.row}>
                   <View style={{flex: 1}}>
                      <InputField label={language === 'hi' ? "लागत मूल्य *" : "Cost Price *"} value={form.costPrice} onChangeText={(v) => update("costPrice", v)} placeholder="₹0.00" colors={colors} keyboardType="decimal-pad" icon="arrow-down-circle-outline" />
                   </View>
                   <View style={{flex: 1}}>
                      <InputField label={language === 'hi' ? "विक्रय मूल्य *" : "Selling Price *"} value={form.sellingPrice} onChangeText={(v) => update("sellingPrice", v)} placeholder="₹0.00" colors={colors} keyboardType="decimal-pad" icon="arrow-up-circle-outline" />
                   </View>
                </View>

                {margin && (
                  <View style={[styles.marginBanner, { backgroundColor: parseFloat(margin) >= 0 ? colors.success + '10' : colors.danger + '10' }]}>
                    <MaterialCommunityIcons name={parseFloat(margin) >= 0 ? "trending-up" : "trending-down"} size={18} color={parseFloat(margin) >= 0 ? colors.success : colors.danger} />
                    <Text style={[styles.marginLabel, { color: colors.textSecondary }]}>
                      {language === 'hi' ? "लाभ मार्जिन:" : "Profit Margin:"}
                    </Text>
                    <Text style={[styles.marginVal, { color: parseFloat(margin) >= 0 ? colors.success : colors.danger }]}>{margin}%</Text>
                  </View>
                )}

                <InputField label={language === 'hi' ? "प्रारंभिक स्टॉक स्तर *" : "Initial Stock Level *"} value={form.currentStock} onChangeText={(v) => update("currentStock", v)} placeholder="0" colors={colors} icon="archive-outline" keyboardType="numeric" />
                
                <View style={styles.row}>
                   <View style={{flex: 1}}>
                     <InputField label={language === 'hi' ? "लो स्टॉक अलर्ट" : "Low Stock Alert"} value={form.reorderLevel} onChangeText={(v) => update("reorderLevel", v)} placeholder="10" colors={colors} keyboardType="numeric" />
                   </View>
                   <View style={{flex: 1}}>
                     <InputField label={language === 'hi' ? "पुनः ऑर्डर मात्रा" : "Reorder Qty"} value={form.reorderQty} onChangeText={(v) => update("reorderQty", v)} placeholder="20" colors={colors} keyboardType="numeric" />
                   </View>
                </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.fields}>
                <View style={styles.group}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    {language === 'hi' ? "जीएसटी दर (%)" : "GST Rate (%)"}
                  </Text>
                  <View style={styles.chipGrid}>
                    {GST_RATES.map((r) => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.chip,
                          {
                            backgroundColor: form.gstRate === String(r) ? colors.primary : colors.gray100,
                            flex: 1,
                          },
                        ]}
                        onPress={() => update("gstRate", String(r))}
                      >
                        <Text style={[styles.chipText, { color: form.gstRate === String(r) ? "#fff" : colors.textPrimary }]}>
                          {r}%
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <InputField label={language === 'hi' ? "HSN कोड" : "HSN Code"} value={form.hsnCode} onChangeText={(v) => update("hsnCode", v)} placeholder="Enter 4-8 digit code" colors={colors} icon="file-document-outline" keyboardType="numeric" />
                
                <View style={[styles.infoCard, { backgroundColor: colors.primary + '08' }]}>
                   <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                   <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                     {language === 'hi' 
                        ? "HSN कोड स्वचालित कर गणना और पेशेवर इनवॉइसिंग में मदद करते हैं।"
                        : "HSN Codes help in automated tax calculation and professional invoicing."}
                   </Text>
                </View>
              </View>
            )}

            {step === 4 && (
              <View style={styles.fields}>
                <InputField label={language === 'hi' ? "सप्लायर / वेंडर का नाम" : "Supplier / Vendor Name"} value={form.supplierName} onChangeText={(v) => update("supplierName", v)} placeholder="e.g. Wholesale Mart" colors={colors} icon="truck-outline" />
                <InputField label={language === 'hi' ? "वेंडर फोन" : "Vendor Phone"} value={form.supplierPhone} onChangeText={(v) => update("supplierPhone", v)} placeholder="+91 XXXXXXXXXX" colors={colors} icon="phone-outline" keyboardType="phone-pad" />
                
                <View style={[styles.smartFeature, { backgroundColor: colors.success + '08' }]}>
                   <View style={styles.smartBadge}>
                      <MaterialCommunityIcons name="creation" size={12} color={colors.success} />
                      <Text style={[styles.smartText, { color: colors.success }]}>
                        {language === 'hi' ? "स्मार्ट फीचर" : "Smart Feature"}
                      </Text>
                   </View>
                   <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                     {language === 'hi'
                        ? "किराना एआई बिक्री की गति और सप्लायर समय के आधार पर पुन: ऑर्डर का सुझाव देगा।"
                        : "KiranaAI will suggest reorders based on sales velocity and supplier lead times."}
                   </Text>
                </View>
              </View>
            )}
          </GlassCard>
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <LinearGradient
           colors={['rgba(255,255,255,0)', '#fff']}
           style={styles.footerGradient}
           pointerEvents="none"
        />
        <View style={styles.actionsRow}>
          {step > 1 && (
             <TouchableOpacity
               style={[styles.prevBtn, { backgroundColor: colors.gray100 }]}
               onPress={() => setStep((s) => (s - 1) as Step)}
             >
               <Feather name="chevron-left" size={20} color={colors.textPrimary} />
             </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.mainBtn, { backgroundColor: step === 4 ? colors.success : colors.primary, flex: 1 }]}
            onPress={() => {
               if(step < 4) {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                 setStep((s) => (s + 1) as Step);
               } else {
                 handleSave();
               }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.btnContent}>
               <Text style={styles.btnText}>{step === 4 ? "Save Product" : "Continue"}</Text>
               <Feather name={step === 4 ? "check" : "chevron-right"} size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  keyboardType,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  keyboardType?: any;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { backgroundColor: 'rgba(0,0,0,0.03)' }]}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.textPlaceholder} style={styles.inputIcon} />}
        <TextInput
          style={[styles.textInput, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textPlaceholder}
          keyboardType={keyboardType ?? "default"}
          selectionColor={colors.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'transparent',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    zIndex: 10,
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  headerInfo: { flex: 1, marginLeft: 8 },
  headerSubtitle: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  stepIndicator: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 16, fontWeight: '900' },
  progressContainer: { flexDirection: "row", height: 4, backgroundColor: 'rgba(0,0,0,0.05)' },
  progressSegment: { height: 4 },
  form: { padding: 20, gap: 20 },
  stepCard: { padding: 24, gap: 20 },
  fields: { gap: 18 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '600',
  },
  group: { gap: 12 },
  label: { fontSize: 13, fontWeight: "800", textTransform: 'uppercase', letterSpacing: 0.5 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  chipText: { fontSize: 14, fontWeight: "800" },
  row: { flexDirection: 'row', gap: 12 },
  marginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 10,
  },
  marginLabel: { fontSize: 14, fontWeight: '600' },
  marginVal: { fontSize: 16, fontWeight: '900' },
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 16, gap: 12, alignItems: 'center' },
  infoText: { fontSize: 13, fontWeight: '600', flex: 1, lineHeight: 18 },
  smartFeature: { padding: 18, borderRadius: 20, gap: 10 },
  smartBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  smartText: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  featureDesc: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 24,
    zIndex: 20,
  },
  footerGradient: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
  },
  actionsRow: { flexDirection: 'row', gap: 12 },
  prevBtn: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  mainBtn: { borderRadius: 18, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  btnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, gap: 12 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
});
