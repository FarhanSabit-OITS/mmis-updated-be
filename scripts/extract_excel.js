const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../Kabale Central Market FTS 1.xlsx');
const OUT_PATH = path.join(__dirname, '../prisma/data/kabale_shops.json');

const outDir = path.dirname(OUT_PATH);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('Reading Excel file...');
const workbook = xlsx.readFile(EXCEL_PATH);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

console.log('Converting to JSON...');
const data = xlsx.utils.sheet_to_json(worksheet, { defval: null });

const cleanedData = data.map((row, index) => {
  const vendorName = row['name'] || "Unknown Vendor";
  let shopName = vendorName.trim();
  // If it doesn't already end with "Shop" or "Store", append " Shop"
  if (!shopName.toLowerCase().includes('shop') && !shopName.toLowerCase().includes('store')) {
    shopName = `${shopName} Shop`;
  }

  return {
    id: index + 1,
    vendorName: vendorName,
    shopName: shopName,
    nin: row['nin'],
    phone: row['phone_no'] ? String(row['phone_no']) : null,
    category: row['category'],
    level: row['fc_no'] ? String(row['fc_no']) : "UNKNOWN",
    monthlyPay: row['mth_pay'] || 0
  };
});

fs.writeFileSync(OUT_PATH, JSON.stringify(cleanedData, null, 2));
console.log(`Saved ${cleanedData.length} records to ${OUT_PATH}`);
