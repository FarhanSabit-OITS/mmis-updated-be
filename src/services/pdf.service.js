/**
 * PDF Generation Service
 * Uses PDFKit for native Windows-compatible PDF rendering.
 * Generates Shop Contracts, Financial Invoices, Receipts, and KYC Certificates
 * in the MarketMaster Brand aesthetic.
 */

const PDFDocument = require('pdfkit');

// ─── Brand Theme ─────────────────────────────────────────────────────────────
const BRAND = {
    primaryDark:  '#0F1C3A',   // Deep navy
    primaryGold:  '#C8A951',   // Market gold
    accentGreen:  '#22C55E',   // Success green
    accentRed:    '#EF4444',   // Danger red
    lightGray:    '#F8FAFC',
    midGray:      '#94A3B8',
    textDark:     '#1E293B',
};

/**
 * Internal helper: draw a branded header with logo text and market info
 */
function drawHeader(doc, title, subtitle = '') {
    // Background bar
    doc.rect(0, 0, doc.page.width, 100).fill(BRAND.primaryDark);

    // MarketMaster wordmark
    doc.font('Helvetica-Bold').fontSize(22).fillColor(BRAND.primaryGold)
       .text('MarketMaster', 40, 28);
    doc.font('Helvetica').fontSize(10).fillColor('#FFFFFF')
       .text('Market Information System', 40, 55);

    // Document type on right
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF')
       .text(title, 0, 32, { align: 'right', width: doc.page.width - 40 });
    if (subtitle) {
        doc.font('Helvetica').fontSize(9).fillColor(BRAND.primaryGold)
           .text(subtitle, 0, 52, { align: 'right', width: doc.page.width - 40 });
    }

    doc.fillColor(BRAND.textDark).moveDown(5);
}

/**
 * Internal helper: section title with gold underline
 */
function sectionTitle(doc, text) {
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.primaryDark).text(text);
    const y = doc.y;
    doc.moveTo(40, y).lineTo(doc.page.width - 40, y)
       .strokeColor(BRAND.primaryGold).lineWidth(1.5).stroke();
    doc.moveDown(0.4);
}

/**
 * Internal helper: key-value row
 */
function infoRow(doc, label, value, y = null) {
    const startY = y || doc.y;
    doc.font('Helvetica-Bold').fontSize(9).fillColor(BRAND.midGray)
       .text(label.toUpperCase(), 40, startY, { width: 160 });
    doc.font('Helvetica').fontSize(10).fillColor(BRAND.textDark)
       .text(value || '—', 210, startY, { width: 340 });
    doc.moveDown(0.6);
}

/**
 * Internal helper: footer strip
 */
function drawFooter(doc, docNumber) {
    const bottom = doc.page.height - 60;
    doc.rect(0, bottom, doc.page.width, 60).fill(BRAND.lightGray);
    doc.moveTo(0, bottom).lineTo(doc.page.width, bottom)
       .strokeColor(BRAND.primaryGold).lineWidth(2).stroke();

    doc.font('Helvetica').fontSize(8).fillColor(BRAND.midGray)
       .text(`Document Ref: ${docNumber}  |  Generated: ${new Date().toUTCString()}  |  MarketMaster MMIS © ${new Date().getFullYear()}`,
             40, bottom + 12, { align: 'center', width: doc.page.width - 80 });
    doc.font('Helvetica').fontSize(7).fillColor(BRAND.midGray)
       .text('This is a system-generated document and is valid without a physical signature.',
             40, bottom + 30, { align: 'center', width: doc.page.width - 80 });
}

// ─── Public Generators ────────────────────────────────────────────────────────

/**
 * Generate a Shop Lease Contract PDF
 * @param {object} data - { facility, vendor, contract, market, issuerName }
 * @returns {Buffer}
 */
exports.generateShopContract = async (data) => {
    return new Promise((resolve, reject) => {
        const { facility, vendor, contract, market, issuerName } = data;
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data',   chunk => chunks.push(chunk));
        doc.on('end',    () => resolve(Buffer.concat(chunks)));
        doc.on('error',  reject);

        const refNo = `SC-${facility?.uniqueCode || 'MMIS'}-${Date.now()}`;

        // Header
        drawHeader(doc, 'SHOP LEASE CONTRACT', market?.name || 'MarketMaster Market');

        // Parties
        sectionTitle(doc, 'PARTIES TO THIS AGREEMENT');
        infoRow(doc, 'Market Authority', market?.name || 'N/A');
        infoRow(doc, 'Market Location', market?.address || 'N/A');
        infoRow(doc, 'Tenant (Vendor)', vendor?.businessName || 'N/A');
        infoRow(doc, 'Vendor Code', vendor?.vendorCode || 'N/A');
        infoRow(doc, 'Tax ID (TIN)', vendor?.taxIdNumber || 'N/A');
        infoRow(doc, 'Business License No.', vendor?.businessLicenseNumber || 'N/A');

        // Facility Details
        sectionTitle(doc, 'PREMISES DETAILS');
        infoRow(doc, 'Unit Number', facility?.unitNumber || 'N/A');
        infoRow(doc, 'Facility Type', facility?.type || 'SHOP');
        infoRow(doc, 'Unit Code', facility?.uniqueCode || 'N/A');
        infoRow(doc, 'Display Name', facility?.displayName || facility?.facilityName || 'N/A');
        infoRow(doc, 'Location', facility?.locationDescription || 'N/A');

        // Financial Terms
        sectionTitle(doc, 'FINANCIAL TERMS');
        infoRow(doc, 'Monthly Rent (UGX)',   formatCurrency(facility?.monthlyRent));
        infoRow(doc, 'Security Deposit',     formatCurrency(facility?.securityDeposit));
        infoRow(doc, 'Maintenance Fee',      formatCurrency(facility?.maintenanceFee));
        infoRow(doc, 'Billing Cycle',        facility?.billingCycle || 'MONTHLY');

        // Contract Period
        sectionTitle(doc, 'CONTRACT PERIOD');
        infoRow(doc, 'Start Date',  formatDate(contract?.startDate || facility?.contractStartDate));
        infoRow(doc, 'End Date',    formatDate(contract?.endDate   || facility?.contractEndDate));
        infoRow(doc, 'Duration',    contract?.duration || 'As per agreement');
        infoRow(doc, 'Issued By',   issuerName || 'Market Authority');

        // Terms
        sectionTitle(doc, 'TERMS & CONDITIONS');
        const terms = [
            '1. The tenant agrees to use the premises solely for lawful commercial activities.',
            '2. Rent is due on the 1st of every month. A 10-day grace period applies.',
            '3. Failure to pay within 30 days constitutes breach of contract and may result in eviction.',
            '4. The tenant shall maintain the premises in a clean and orderly condition at all times.',
            '5. Sub-letting or transfer of this contract is strictly prohibited without written authority consent.',
            '6. The Market Authority reserves the right to inspect the premises at any time.',
            '7. This contract is governed by the laws of Uganda and any disputes shall be resolved accordingly.',
        ];
        doc.font('Helvetica').fontSize(9).fillColor(BRAND.textDark);
        terms.forEach(t => {
            doc.text(t, 40, doc.y, { width: doc.page.width - 80 });
            doc.moveDown(0.4);
        });

        // Signature Block
        sectionTitle(doc, 'SIGNATURES');
        const sigY = doc.y + 20;
        doc.font('Helvetica-Bold').fontSize(10).fillColor(BRAND.textDark);
        doc.text('Tenant Signature:', 40, sigY);
        doc.moveTo(170, sigY + 14).lineTo(340, sigY + 14).strokeColor(BRAND.primaryDark).lineWidth(1).stroke();
        doc.text('Market Authority:', doc.page.width / 2 + 20, sigY);
        doc.moveTo(doc.page.width / 2 + 150, sigY + 14).lineTo(doc.page.width - 40, sigY + 14).strokeColor(BRAND.primaryDark).lineWidth(1).stroke();

        drawFooter(doc, refNo);
        doc.end();
    });
};

/**
 * Generate an Invoice PDF
 * @param {object} data - { vendor, market, lineItems, invoiceNumber, dueDate, issuedBy }
 * @returns {Buffer}
 */
exports.generateInvoice = async (data) => {
    return new Promise((resolve, reject) => {
        const { vendor, market, lineItems = [], invoiceNumber, dueDate, issuedBy } = data;
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data',  chunk => chunks.push(chunk));
        doc.on('end',   () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const refNo = invoiceNumber || `INV-${Date.now()}`;
        drawHeader(doc, 'OFFICIAL INVOICE', market?.name || 'MarketMaster Market');

        // Invoice meta
        sectionTitle(doc, 'INVOICE DETAILS');
        infoRow(doc, 'Invoice Number', refNo);
        infoRow(doc, 'Issue Date',     formatDate(new Date()));
        infoRow(doc, 'Due Date',       formatDate(dueDate));
        infoRow(doc, 'Issued By',      issuedBy || market?.name || 'Market Authority');

        // Bill To
        sectionTitle(doc, 'BILLED TO');
        infoRow(doc, 'Business Name', vendor?.businessName || 'N/A');
        infoRow(doc, 'Vendor Code',   vendor?.vendorCode || 'N/A');
        infoRow(doc, 'Tax ID (TIN)',  vendor?.taxIdNumber || 'N/A');

        // Line Items Table
        sectionTitle(doc, 'ITEMS');
        const tableTop  = doc.y + 4;
        const colDesc   = 40;
        const colQty    = 310;
        const colUnit   = 380;
        const colAmount = 470;

        // Table header
        doc.rect(40, tableTop, doc.page.width - 80, 22).fill(BRAND.primaryDark);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF');
        doc.text('Description',    colDesc,   tableTop + 6);
        doc.text('Qty',            colQty,    tableTop + 6);
        doc.text('Unit Price',     colUnit,   tableTop + 6);
        doc.text('Amount (UGX)',   colAmount, tableTop + 6);

        let rowY = tableTop + 26;
        let total = 0;
        doc.font('Helvetica').fontSize(9).fillColor(BRAND.textDark);
        lineItems.forEach((item, i) => {
            const bg = i % 2 === 0 ? '#FFFFFF' : BRAND.lightGray;
            doc.rect(40, rowY - 4, doc.page.width - 80, 20).fill(bg);
            const amount = (item.qty || 1) * (item.unitPrice || 0);
            total += amount;
            doc.fillColor(BRAND.textDark)
               .text(item.description || 'Service',     colDesc,  rowY)
               .text(String(item.qty || 1),              colQty,   rowY)
               .text(formatCurrency(item.unitPrice),     colUnit,  rowY)
               .text(formatCurrency(amount),             colAmount, rowY);
            rowY += 22;
        });

        // Total row
        doc.rect(40, rowY, doc.page.width - 80, 24).fill(BRAND.primaryDark);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.primaryGold)
           .text('TOTAL DUE (UGX)',  colDesc,   rowY + 6)
           .text(formatCurrency(total), colAmount, rowY + 6);
        doc.moveDown(6);

        // Payment instructions
        sectionTitle(doc, 'PAYMENT INSTRUCTIONS');
        doc.font('Helvetica').fontSize(9).fillColor(BRAND.textDark)
           .text('Please settle this invoice before the due date via Mobile Money or direct bank transfer.', 40, doc.y, { width: doc.page.width - 80 })
           .moveDown(0.4)
           .text('Late payments attract a 5% monthly surcharge as per Market Authority regulations.');

        drawFooter(doc, refNo);
        doc.end();
    });
};

/**
 * Generate a Payment Receipt PDF
 * @param {object} data - { vendor, market, amount, paymentMethod, refNumber, paidAt, receivedBy }
 * @returns {Buffer}
 */
exports.generateReceipt = async (data) => {
    return new Promise((resolve, reject) => {
        const { vendor, market, amount, paymentMethod, refNumber, paidAt, receivedBy } = data;
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data',  chunk => chunks.push(chunk));
        doc.on('end',   () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const refNo = refNumber || `RCP-${Date.now()}`;
        drawHeader(doc, 'PAYMENT RECEIPT', market?.name || 'MarketMaster Market');

        // Green stamp
        doc.rect(doc.page.width - 180, 115, 140, 40).fill(BRAND.accentGreen);
        doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF')
           .text('✓  PAID', doc.page.width - 175, 126);

        sectionTitle(doc, 'RECEIPT DETAILS');
        infoRow(doc, 'Receipt Number', refNo);
        infoRow(doc, 'Payment Date',   formatDate(paidAt || new Date()));
        infoRow(doc, 'Payment Method', paymentMethod || 'N/A');
        infoRow(doc, 'Received By',    receivedBy || 'Market Authority');

        sectionTitle(doc, 'PAYER DETAILS');
        infoRow(doc, 'Business Name', vendor?.businessName || 'N/A');
        infoRow(doc, 'Vendor Code',   vendor?.vendorCode || 'N/A');

        sectionTitle(doc, 'PAYMENT SUMMARY');

        // Big amount display
        const amtY = doc.y + 10;
        doc.rect(40, amtY, doc.page.width - 80, 70).fill(BRAND.lightGray);
        doc.rect(40, amtY, doc.page.width - 80, 70).strokeColor(BRAND.primaryGold).lineWidth(2).stroke();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.midGray)
           .text('AMOUNT RECEIVED', 0, amtY + 12, { align: 'center', width: doc.page.width });
        doc.font('Helvetica-Bold').fontSize(28).fillColor(BRAND.primaryDark)
           .text(formatCurrency(amount) + ' UGX', 0, amtY + 30, { align: 'center', width: doc.page.width });
        doc.moveDown(6);

        doc.font('Helvetica').fontSize(9).fillColor(BRAND.midGray)
           .text('This receipt confirms that full payment has been received. Please retain for your records.', 40, doc.y, { align: 'center', width: doc.page.width - 80 });

        drawFooter(doc, refNo);
        doc.end();
    });
};

/**
 * Generate a Market Analytics System Report PDF
 * @param {object} data - { market, stats, generatedBy, period }
 * @returns {Buffer}
 */
exports.generateSystemReport = async (data) => {
    return new Promise((resolve, reject) => {
        const { market, stats, generatedBy, period } = data;
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const chunks = [];

        doc.on('data',  chunk => chunks.push(chunk));
        doc.on('end',   () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const refNo = `RPT-${market?.uniqueCode || 'MMIS'}-${Date.now()}`;
        drawHeader(doc, 'MARKET ANALYTICS REPORT', `Period: ${period || 'Current Month'}`);

        sectionTitle(doc, 'REPORT METADATA');
        infoRow(doc, 'Market Name',    market?.name || 'N/A');
        infoRow(doc, 'Market Code',    market?.uniqueCode || 'N/A');
        infoRow(doc, 'Generated By',   generatedBy || 'Market Authority');
        infoRow(doc, 'Generated On',   formatDate(new Date()));
        infoRow(doc, 'Report Period',  period || 'N/A');

        sectionTitle(doc, 'OCCUPANCY METRICS');
        const total    = stats?.totalFacilities    || 0;
        const occupied = stats?.occupiedFacilities  || 0;
        const vacant   = total - occupied;
        const rate     = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0';

        infoRow(doc, 'Total Facilities',     String(total));
        infoRow(doc, 'Occupied Facilities',  String(occupied));
        infoRow(doc, 'Vacant Facilities',    String(vacant));
        infoRow(doc, 'Occupancy Rate',       `${rate}%`);

        // Visual bar
        const barY = doc.y + 8;
        doc.rect(40, barY, 400, 18).fill('#E2E8F0');
        const filled = Math.min((occupied / Math.max(total, 1)) * 400, 400);
        doc.rect(40, barY, filled, 18).fill(filled / 400 > 0.7 ? BRAND.accentGreen : BRAND.primaryGold);
        doc.font('Helvetica-Bold').fontSize(9).fillColor('#FFFFFF')
           .text(`${rate}% Occupied`, 46, barY + 4);
        doc.moveDown(3);

        sectionTitle(doc, 'COMPLIANCE METRICS');
        infoRow(doc, 'Total Vendors',           String(stats?.totalVendors || 0));
        infoRow(doc, 'KYC Verified Vendors',    String(stats?.kycVerified || 0));
        infoRow(doc, 'Delinquent Vendors',       String(stats?.delinquent || 0));
        infoRow(doc, 'Compliance Rate',          stats?.totalVendors
            ? `${(((stats.totalVendors - stats.delinquent) / stats.totalVendors) * 100).toFixed(1)}%`
            : 'N/A');

        sectionTitle(doc, 'REVENUE METRICS');
        infoRow(doc, 'Total Revenue Collected (UGX)', formatCurrency(stats?.totalRevenue));
        infoRow(doc, 'Outstanding Dues (UGX)',         formatCurrency(stats?.outstandingDues));
        infoRow(doc, 'Pending KYC Submissions',        String(stats?.pendingKyc || 0));

        doc.moveDown(1);
        doc.font('Helvetica').fontSize(8).fillColor(BRAND.midGray)
           .text('This report is classified as CONFIDENTIAL and intended solely for Market Authorities and Government regulators.', 40, doc.y, { width: doc.page.width - 80 });

        drawFooter(doc, refNo);
        doc.end();
    });
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
    if (!amount && amount !== 0) return '—';
    return Number(amount).toLocaleString('en-UG', { minimumFractionDigits: 0 });
}

function formatDate(date) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}
