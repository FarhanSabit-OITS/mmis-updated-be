/**
 * Token PDF Service
 * Generates printable gate tokens and KYC verification tokens
 * in the MarketMaster brand aesthetic using PDFKit.
 */

const PDFDocument = require('pdfkit');

const BRAND = {
  primaryDark: '#0F1C3A',
  primaryGold: '#C8A951',
  accentGreen: '#22C55E',
  midGray:     '#94A3B8',
  lightGray:   '#F8FAFC',
  textDark:    '#1E293B',
};

/**
 * Generate a physical Gate Entry / Delivery Token PDF
 * @param {object} data - token record with all relations
 * @returns {Buffer}
 */
exports.generateGateToken = async (data) => {
  return new Promise((resolve, reject) => {
    const {
      tokenCode, tokenType, vendorName, vendorCode, marketName,
      facilityName, validFrom, validUntil, issuedBy, payload
    } = data;

    const doc    = new PDFDocument({ margin: 40, size: 'A5', layout: 'portrait' });
    const chunks = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;

    // ── Header strip ──────────────────────────────────────────────────────────
    doc.rect(0, 0, pageW, 80).fill(BRAND.primaryDark);
    doc.font('Helvetica-Bold').fontSize(18).fillColor(BRAND.primaryGold)
       .text('MarketMaster', 30, 18);
    doc.font('Helvetica').fontSize(9).fillColor('#FFF')
       .text('Official Gate Token', 30, 42);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFF')
       .text(marketName || 'Market Authority', 0, 32, { align: 'right', width: pageW - 30 });

    doc.moveDown(4.5);

    // ── Token type badge ──────────────────────────────────────────────────────
    const badgeColor = tokenType === 'ENTRY' ? BRAND.accentGreen
                     : tokenType === 'EXIT'  ? '#EF4444'
                     : tokenType === 'SUPPLIER_DELIVERY' ? '#6366F1'
                     : BRAND.primaryGold;

    doc.rect(30, doc.y, pageW - 60, 28).fill(badgeColor);
    doc.font('Helvetica-Bold').fontSize(12).fillColor('#FFF')
       .text(tokenType?.replace(/_/g, ' ') || 'GATE TOKEN', 0, doc.y - 22, { align: 'center', width: pageW });
    doc.moveDown(1.5);

    // ── Large token code ──────────────────────────────────────────────────────
    const codeY = doc.y + 10;
    doc.rect(30, codeY - 6, pageW - 60, 64).fill(BRAND.lightGray);
    doc.rect(30, codeY - 6, pageW - 60, 64).strokeColor(BRAND.primaryGold).lineWidth(2).stroke();
    doc.font('Courier-Bold').fontSize(28).fillColor(BRAND.primaryDark)
       .text(tokenCode || 'XXXXXXXX', 0, codeY + 8, { align: 'center', width: pageW });
    doc.moveDown(5);

    // ── Details grid ─────────────────────────────────────────────────────────
    const rowY = (label, value, y) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND.midGray).text(label.toUpperCase(), 30, y, { width: 100 });
      doc.font('Helvetica').fontSize(9).fillColor(BRAND.textDark).text(value || '—', 140, y, { width: pageW - 170 });
    };

    let y = doc.y;
    rowY('Holder',    vendorName   || 'N/A', y); y += 18;
    rowY('Code',      vendorCode   || 'N/A', y); y += 18;
    rowY('Facility',  facilityName || 'N/A', y); y += 18;
    rowY('Valid From', formatTokenDate(validFrom),  y); y += 18;
    rowY('Valid Until', formatTokenDate(validUntil), y); y += 18;
    rowY('Issued By',  issuedBy   || 'Gate Authority', y); y += 18;

    // Extra payload items
    if (payload && typeof payload === 'object') {
      Object.entries(payload).forEach(([k, v]) => {
        if (v && k !== 'photo') {
          rowY(k, String(v), y);
          y += 18;
        }
      });
    }

    doc.y = y + 10;

    // ── Barcode-style visual ──────────────────────────────────────────────────
    const barY = doc.y;
    const code = (tokenCode || 'TOKEN').split('');
    let bx = 30;
    code.forEach((_, i) => {
      const w = (i % 3 === 0) ? 4 : (i % 3 === 1) ? 2 : 3;
      doc.rect(bx, barY, w, 35).fill(i % 2 === 0 ? BRAND.primaryDark : BRAND.lightGray);
      bx += w + 1;
    });
    doc.font('Helvetica').fontSize(7).fillColor(BRAND.midGray)
       .text(tokenCode || '', 30, barY + 40, { align: 'center', width: pageW - 60 });

    // ── Footer ────────────────────────────────────────────────────────────────
    const bottom = doc.page.height - 50;
    doc.rect(0, bottom, pageW, 50).fill(BRAND.lightGray);
    doc.moveTo(0, bottom).lineTo(pageW, bottom).strokeColor(BRAND.primaryGold).lineWidth(1.5).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(BRAND.midGray)
       .text(`Generated: ${new Date().toUTCString()} · Ref: ${tokenCode}`, 30, bottom + 8, { align: 'center', width: pageW - 60 });
    doc.font('Helvetica').fontSize(6).fillColor(BRAND.midGray)
       .text('This token is valid only for the stated period. Present at gate for scanning.', 30, bottom + 24, { align: 'center', width: pageW - 60 });

    doc.end();
  });
};

/**
 * Generate a KYC Verification Certificate PDF (emailed or printed)
 * @param {object} data - { vendorName, vendorCode, nidNumber, tinNumber, binnNumber, verifiedAt, verifiedBy, marketName, tokenCode }
 * @returns {Buffer}
 */
exports.generateKycCertificate = async (data) => {
  return new Promise((resolve, reject) => {
    const {
      vendorName, vendorCode, nidNumber, tinNumber, binnNumber,
      verifiedAt, verifiedBy, marketName, tokenCode,
      stakeholderType = 'VENDOR'
    } = data;

    const doc    = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];
    doc.on('data',  c => chunks.push(c));
    doc.on('end',   () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;

    // Navy Header
    doc.rect(0, 0, pageW, 110).fill(BRAND.primaryDark);
    doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND.primaryGold).text('MarketMaster', 40, 26);
    doc.font('Helvetica').fontSize(10).fillColor('#FFF').text('Market Information System (MMIS)', 40, 54);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#FFF')
       .text('IDENTITY VERIFICATION CERTIFICATE', 0, 74, { align: 'center', width: pageW });
    doc.rect(0, 105, pageW, 5).fill(BRAND.primaryGold);

    // Seal decoration
    doc.circle(pageW - 80, 62, 38).fill(BRAND.primaryGold + '22').stroke(BRAND.primaryGold);
    doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND.primaryGold)
       .text('VERIFIED', pageW - 104, 58);

    doc.fillColor(BRAND.textDark).moveDown(5);

    // Market / certificate info
    doc.font('Helvetica').fontSize(10).fillColor(BRAND.midGray)
       .text(`This certifies that the following ${stakeholderType.toLowerCase()} has completed KYC verification:`,
             40, doc.y, { align: 'center', width: pageW - 80 });
    doc.moveDown(1.5);

    // Holder block
    doc.rect(40, doc.y, pageW - 80, 80).fill(BRAND.lightGray);
    doc.rect(40, doc.y, pageW - 80, 80).strokeColor(BRAND.primaryGold).lineWidth(2).stroke();
    const blockY = doc.y + 10;
    doc.font('Helvetica-Bold').fontSize(16).fillColor(BRAND.primaryDark)
       .text(vendorName || 'N/A', 0, blockY, { align: 'center', width: pageW });
    doc.font('Helvetica').fontSize(10).fillColor(BRAND.midGray)
       .text(vendorCode ? `Code: ${vendorCode}` : '', 0, blockY + 28, { align: 'center', width: pageW });
    doc.font('Helvetica-Bold').fontSize(10).fillColor(badgeColorByType(stakeholderType))
       .text(stakeholderType, 0, blockY + 46, { align: 'center', width: pageW });
    doc.moveDown(6.5);

    // Verified IDs
    const col1 = 40, col2 = 190, col3 = 345;
    const idY  = doc.y;

    [
      { label: 'National ID (NID)', value: maskId(nidNumber), col: col1 },
      { label: 'Tax ID (TIN)',       value: maskId(tinNumber),  col: col2 },
      { label: 'Business ID (BINN)',  value: maskId(binnNumber), col: col3 },
    ].forEach(({ label, value, col }) => {
      doc.rect(col, idY, 140, 52).fill('#EFF6FF');
      doc.rect(col, idY, 140, 52).strokeColor('#BFDBFE').lineWidth(1).stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor(BRAND.midGray).text(label, col + 8, idY + 8, { width: 125 });
      doc.font('Courier-Bold').fontSize(11).fillColor(BRAND.primaryDark).text(value || '—', col + 8, idY + 24, { width: 125 });
    });

    doc.moveDown(5);

    // Verified By + Date
    const detailY = doc.y + 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.primaryDark).text('Verification Details', 40, detailY);
    doc.moveTo(40, detailY + 16).lineTo(pageW - 40, detailY + 16).strokeColor(BRAND.primaryGold).lineWidth(1.5).stroke();
    let vy = detailY + 24;
    const detail = (label, value) => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.midGray).text(label.toUpperCase(), 40, vy, { width: 160 });
      doc.font('Helvetica').fontSize(10).fillColor(BRAND.textDark).text(value || '—', 210, vy, { width: pageW - 250 });
      vy += 20;
    };
    detail('Market Authority', marketName || 'N/A');
    detail('Verified By',      verifiedBy || 'Market Administrator');
    detail('Date of Verification', formatTokenDate(verifiedAt || new Date()));
    detail('Certificate Code',     tokenCode || 'CERT-' + Date.now());
    detail('Biometric Data',       'Captured & Encrypted ✓');
    doc.y = vy + 10;

    // Security statement
    doc.rect(40, doc.y, pageW - 80, 40).fill('#F0FDF4');
    doc.rect(40, doc.y, pageW - 80, 40).strokeColor('#BBF7D0').lineWidth(1).stroke();
    doc.font('Helvetica').fontSize(8.5).fillColor('#166534')
       .text('⚠ This certificate is issued under the authority of the Uganda Market Information System. ' +
             'Any tampering renders it void. Verify authenticity at marketmaster.ug/verify',
             50, doc.y + 10, { width: pageW - 100 });
    doc.moveDown(4);

    // Signature area
    const sigY = doc.y + 10;
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.textDark).text('Authorised Signature:', 40, sigY);
    doc.moveTo(200, sigY + 14).lineTo(360, sigY + 14).strokeColor(BRAND.primaryDark).lineWidth(1).stroke();
    doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.textDark).text('Official Seal:', pageW / 2 + 30, sigY);
    doc.circle(pageW - 90, sigY + 15, 28).strokeColor(BRAND.primaryGold).lineWidth(2).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(BRAND.midGray)
       .text('MMIS SEAL', pageW - 107, sigY + 9);

    // Footer
    const footerY = doc.page.height - 55;
    doc.rect(0, footerY, pageW, 55).fill(BRAND.lightGray);
    doc.moveTo(0, footerY).lineTo(pageW, footerY).strokeColor(BRAND.primaryGold).lineWidth(2).stroke();
    doc.font('Helvetica').fontSize(8).fillColor(BRAND.midGray)
       .text(`Ref: ${tokenCode || 'N/A'} · Issued: ${new Date().toUTCString()} · MarketMaster MMIS © ${new Date().getFullYear()}`,
             40, footerY + 12, { align: 'center', width: pageW - 80 });
    doc.font('Helvetica').fontSize(7).fillColor(BRAND.midGray)
       .text('Verify this certificate: https://marketmaster.ug/verify',
             40, footerY + 30, { align: 'center', width: pageW - 80 });

    doc.end();
  });
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatTokenDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function maskId(id) {
  if (!id) return '—';
  if (id.length <= 4) return id;
  return id.slice(0, 4) + '••••' + id.slice(-2);
}

function badgeColorByType(type) {
  return type === 'SUPPLIER' ? '#6366F1' : type === 'MEMBER' ? '#0EA5E9' : '#0F1C3A';
}
