import { Bill } from "@/types/billing.types";
import { Product } from "@/types/inventory.types";
import { Forecast } from "@/types/forecast.types";

/**
 * Organic Intelligence Engine
 * --------------------------
 * Analyzes sales velocity, current stock, and reorder patterns
 * to generate data-driven stock predictions.
 */

export function analyzeProductDemand(
  product: Product,
  bills: Bill[],
  language: "en" | "hi" = "en"
): Forecast {
  // 1. Calculate Daily Velocity (Sales over the last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  let totalQtySold = 0;
  bills.forEach((bill) => {
    if (new Date(bill.createdAt) >= fourteenDaysAgo) {
      const item = bill.items.find((i) => i.productId === product.id);
      if (item) totalQtySold += item.quantity;
    }
  });

  const dailyVelocity = totalQtySold / 14;
  const safetyBuffer = 1.2; // 20% projection buffer

  // 2. Projections
  const forecast7d = +(dailyVelocity * 7 * safetyBuffer).toFixed(1);
  const forecast14d = +(dailyVelocity * 14 * safetyBuffer).toFixed(1);
  const forecast30d = +(dailyVelocity * 30 * safetyBuffer).toFixed(1);

  // 3. Logic: When do we run out?
  const daysRemaining = dailyVelocity > 0 ? product.currentStock / dailyVelocity : 999;
  const restockNow = daysRemaining < 7 || product.currentStock <= product.reorderLevel;

  // 4. Intelligence Notes (Seasonal / Festival Logic)
  const currentMonth = new Date().getMonth(); // 0-indexed
  let seasonalNote = "";
  let surgeFactor = 0;

  if (currentMonth === 2) { // March (Holi)
    seasonalNote = language === 'hi' ? "होली के कारण मांग में 25% की वृद्धि संभव" : "25% demand surge expected due to Holi";
    surgeFactor = 0.25;
  } else if (currentMonth === 9 || currentMonth === 10) { // Oct/Nov (Diwali)
    seasonalNote = language === 'hi' ? "त्योहारी सीजन: स्टॉक 40% बढ़ाएं" : "Festival Season: Increase stock by 40%";
    surgeFactor = 0.40;
  }

  // 5. Bilingual Reasoning
  let reasoning = "";
  if (restockNow) {
    reasoning = language === 'hi' 
      ? `वर्तमान स्टॉक (${product.currentStock}) अगले 7 दिनों के लिए पर्याप्त नहीं है। कृपया तुरंत ${product.reorderQty} ${product.unit} का ऑर्डर दें।`
      : `Current stock (${product.currentStock}) is insufficient for the next 7 days. Order ${product.reorderQty} ${product.unit} immediately.`;
  } else {
    reasoning = language === 'hi'
      ? `बिक्री स्थिर है। सोमवार को पुन: स्टॉक करने पर विचार करें जब मांग आमतौर पर बढ़ जाती है।`
      : `Sales are steady. Consider restocking on Monday when demand typically rises.`;
  }

  return {
    id: `forecast_${product.id}_${Date.now()}`,
    productId: product.id,
    storeId: product.storeId,
    productName: product.name,
    productCategory: product.category,
    currentStock: product.currentStock,
    reorderLevel: product.reorderLevel,
    unit: product.unit,
    supplierName: product.supplierName,
    supplierPhone: product.supplierPhone,
    forecast7d: Math.max(forecast7d, 1),
    forecast14d: Math.max(forecast14d, 2),
    forecast30d: Math.max(forecast30d, 5),
    restockNow,
    recommendedQty: Math.max(product.reorderQty, Math.ceil(forecast14d * (1 + surgeFactor))),
    bestReorderDay: restockNow ? "Today" : "Monday",
    seasonalNote: seasonalNote || undefined,
    confidence: dailyVelocity > 0 ? "High" : "Medium",
    reasoning,
    generatedAt: new Date().toISOString(),
  };
}
