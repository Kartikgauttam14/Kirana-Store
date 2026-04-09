export interface GSTBreakdown {
  taxableAmount: number;
  cgst: number;
  sgst: number;
  totalGST: number;
  totalWithGST: number;
}

export function calculateGST(sellingPrice: number, gstRate: number): GSTBreakdown {
  const taxableAmount = sellingPrice / (1 + gstRate / 100);
  const totalGST = sellingPrice - taxableAmount;

  return {
    taxableAmount: +taxableAmount.toFixed(2),
    cgst: +(totalGST / 2).toFixed(2),
    sgst: +(totalGST / 2).toFixed(2),
    totalGST: +totalGST.toFixed(2),
    totalWithGST: +sellingPrice.toFixed(2),
  };
}

export function aggregateBillGST(
  items: Array<{ sellingPrice: number; quantity: number; gstRate: number }>
) {
  const slabs: Record<number, { taxable: number; gst: number }> = {};
  items.forEach((item) => {
    const line = item.sellingPrice * item.quantity;
    const breakdown = calculateGST(line, item.gstRate);
    if (!slabs[item.gstRate]) slabs[item.gstRate] = { taxable: 0, gst: 0 };
    slabs[item.gstRate].taxable += breakdown.taxableAmount;
    slabs[item.gstRate].gst += breakdown.totalGST;
  });
  return slabs;
}
