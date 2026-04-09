import React from "react";

import { Badge } from "@/components/ui/Badge";
import { Product, getStockStatus } from "@/types/inventory.types";

export function StockBadge({ product }: { product: Product }) {
  const status = getStockStatus(product);
  if (status === "outOfStock") return <Badge label="Out of Stock" variant="danger" size="sm" />;
  if (status === "lowStock") return <Badge label="Low Stock" variant="warning" size="sm" />;
  return <Badge label="In Stock" variant="success" size="sm" />;
}
