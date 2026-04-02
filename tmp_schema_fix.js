const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'prisma/schema.prisma');
let content = fs.readFileSync(file, 'utf8');

const regexesToRemove = [
  /^\s*@@index\(\[uniqueCode\]\)\r?\n/gm,
  /^\s*@@index\(\[shortCode\]\)\r?\n/gm,
  /^\s*@@index\(\[qrCode\]\)\r?\n/gm,
  /^\s*@@index\(\[tokenCode\]\)\r?\n/gm,
  /^\s*@@index\(\[status\]\)\r?\n/gm,
  /^\s*@@index\(\[paymentStatus\]\)\r?\n/gm,
  /^\s*@@index\(\[kycStatus\]\)\r?\n/gm,
  /^\s*@@index\(\[isActive\]\)\r?\n/gm,
  /^\s*@@index\(\[isValid\]\)\r?\n/gm,
  /^\s*@@index\(\[isRead\]\)\r?\n/gm,
  /^\s*@@index\(\[role\]\)\r?\n/gm,
  /^\s*@@index\(\[adminLevel\]\)\r?\n/gm,
  /^\s*@@index\(\[stallType\]\)\r?\n/gm,
  /^\s*@@index\(\[shopType\]\)\r?\n/gm,
  /^\s*@@index\(\[gateType\]\)\r?\n/gm,
  /^\s*@@index\(\[stakeholderType\]\)\r?\n/gm,
  /^\s*@@index\(\[occupationStatus\]\)\r?\n/gm,
];

let before = content.length;
regexesToRemove.forEach(regex => {
  content = content.replace(regex, '');
});
let after = content.length;

fs.writeFileSync(file, content);
console.log(`Removed ${before - after} chars from schema.prisma.`);
