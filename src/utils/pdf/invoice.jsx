import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  Circle,
  renderToBuffer,
} from "@react-pdf/renderer";

const BRAND_PRIMARY = "#432dd7"; // Deep Indigo
const BRAND_DARK = "#261685"; // Darker Indigo for gradient
const BRAND_ACCENT = "#0D9488"; // Teal 600
const TEXT_DARK = "#0F172A"; // Slate 900
const TEXT_MUTED = "#64748b"; // Slate 500
const BG_LIGHT = "#F8FAFC"; // Slate 50
const BORDER_COLOR = "#E2E8F0"; // Slate 200

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    fontFamily: "Helvetica",
    color: TEXT_DARK,
  },

  // --- HERO HEADER ---
  heroSection: {
    position: "relative",
    height: 220,
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    padding: 40,
    paddingBottom: 50,
    color: "#FFFFFF",
    height: "100%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  // Brand & Logo Area
  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    marginRight: 12,
  },
  brandTextContainer: {
    flexDirection: "column",
  },
  brandName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 22,
    letterSpacing: -0.5,
  },
  brandSlogan: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
    fontFamily: "Helvetica",
  },

  statusBadge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    overflow: "hidden",
  },

  heroBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  amountDueLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 4,
  },
  amountDueValue: {
    fontFamily: "Helvetica-Bold",
    fontSize: 36,
  },
  dueDateBox: {
    alignItems: "flex-end",
  },

  // --- BODY SECTION ---
  bodySection: {
    padding: 40,
    paddingTop: 30,
  },
  metaGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_COLOR,
  },
  metaColumn: {
    width: "45%",
  },
  metaLabel: {
    fontSize: 9,
    color: TEXT_MUTED,
    textTransform: "uppercase",
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 1.4,
  },

  // --- TABLES ---
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    marginBottom: 12,
    color: BRAND_PRIMARY,
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: BRAND_PRIMARY,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BG_LIGHT,
  },
  colDesc: { width: "65%" },
  colAmount: { width: "35%", textAlign: "right" },

  colHeaderText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: TEXT_MUTED,
  },
  rowText: {
    fontSize: 10,
  },

  // --- TOTALS ---
  totalsWrapper: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    marginBottom: 40,
  },
  totalsBox: {
    width: "50%",
    backgroundColor: BG_LIGHT,
    padding: 16,
    borderRadius: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 10,
    color: TEXT_MUTED,
  },
  totalValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },

  // --- FOOTER ---
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER_COLOR,
    paddingTop: 15,
  },
  footerText: {
    fontSize: 9,
    color: TEXT_MUTED,
    marginLeft: 8,
  },
});

export const InvoicePDF = ({ invoice }) => {
  const formatMoney = (amount) => {
    return new Intl.NumberFormat("en-UG", {
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("en-UG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* === HERO HEADER SECTION === */}
        <View style={styles.heroSection}>
          <Svg
            style={styles.heroBackground}
            viewBox="0 0 600 220"
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient id="heroGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={BRAND_PRIMARY} />
                <Stop offset="100%" stopColor={BRAND_DARK} />
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url('#heroGradient')"
            />
            {/* Geometric Overlays for Visual Interest */}
            <Circle cx="600" cy="0" r="200" fill="#FFFFFF" fillOpacity="0.03" />
            <Circle
              cx="50"
              cy="220"
              r="100"
              fill="#FFFFFF"
              fillOpacity="0.04"
            />
          </Svg>

          <View style={styles.heroContent}>
            <View style={styles.heroTopRow}>
              <View style={styles.brandContainer}>
                <View style={styles.logoBox}>
                  <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                    <Path d="M12 2L2 7l10 5 10-5-10-5z" fill="#FFFFFF" />
                    <Path
                      d="M2 17l10 5 10-5M2 12l10 5 10-5"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                {/* Titles */}
                <View style={styles.brandTextContainer}>
                  <Text style={styles.brandName}>MMIS</Text>
                  <Text style={styles.brandSlogan}>
                    Empowering African Markets with Technology.
                  </Text>
                </View>
              </View>

              <Text style={styles.statusBadge}>{invoice.status}</Text>
            </View>

            <View style={styles.heroBottomRow}>
              <View>
                <Text style={styles.amountDueLabel}>Total Amount Due</Text>
                <Text style={styles.amountDueValue}>
                  {formatMoney(invoice.outstandingAmount)}{" "}
                  {invoice.currencyCode}
                </Text>
              </View>
              <View style={styles.dueDateBox}>
                <Text style={styles.amountDueLabel}>Due Date</Text>
                <Text style={[styles.amountDueValue, { fontSize: 18 }]}>
                  {formatDate(invoice.dueDate)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* === BODY SECTION === */}
        <View style={styles.bodySection}>
          <View style={styles.metaGrid}>
            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Billed To</Text>
              <Text
                style={[
                  styles.metaValue,
                  { fontFamily: "Helvetica-Bold", fontSize: 14 },
                ]}
              >
                {invoice.vendor.businessName}
              </Text>
              <Text style={styles.metaLabel}>Shop Assignment</Text>
              <Text style={styles.metaValue}>{invoice.shop.shopNumber}</Text>
            </View>

            <View style={styles.metaColumn}>
              <Text style={styles.metaLabel}>Invoice Number</Text>
              <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View>
                  <Text style={styles.metaLabel}>Issue Date</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(invoice.issueDate)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>Billing Date</Text>
                  <Text style={styles.metaValue}>
                    {formatDate(invoice.billingStartDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* LINE ITEMS TABLE */}
          <Text style={styles.sectionTitle}>Invoice Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc, styles.colHeaderText]}>
                DESCRIPTION
              </Text>
              <Text style={[styles.colAmount, styles.colHeaderText]}>
                AMOUNT ({invoice.currencyCode})
              </Text>
            </View>
            {invoice.lineItems.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <Text style={[styles.colDesc, styles.rowText]}>
                  {item.description}
                </Text>
                <Text
                  style={[
                    styles.colAmount,
                    styles.rowText,
                    { fontFamily: "Helvetica-Bold" },
                  ]}
                >
                  {formatMoney(item.lineAmount)}
                </Text>
              </View>
            ))}
          </View>

          {/* FINANCIAL SUMMARY BOX */}
          <View style={styles.totalsWrapper}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>
                  {formatMoney(invoice.totalAmount)}
                </Text>
              </View>
              <View
                style={[
                  styles.totalRow,
                  {
                    borderBottomWidth: 1,
                    borderBottomColor: BORDER_COLOR,
                    paddingBottom: 8,
                  },
                ]}
              >
                <Text style={styles.totalLabel}>Payments Received</Text>
                <Text style={[styles.totalValue, { color: BRAND_ACCENT }]}>
                  -{formatMoney(invoice.paidAmount)}
                </Text>
              </View>
              <View
                style={[styles.totalRow, { marginTop: 8, marginBottom: 0 }]}
              >
                <Text
                  style={[
                    styles.totalLabel,
                    { color: TEXT_DARK, fontFamily: "Helvetica-Bold" },
                  ]}
                >
                  Outstanding Balance
                </Text>
                <Text
                  style={[
                    styles.totalValue,
                    { color: BRAND_PRIMARY, fontSize: 12 },
                  ]}
                >
                  {formatMoney(invoice.outstandingAmount)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* === FOOTER === */}
        <View style={styles.footer}>
          <Svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke={TEXT_MUTED}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </Svg>
          <Text style={styles.footerText}>
            Securely generated by MMIS System
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function renderInvoicePdf(invoice) {
  return await renderToBuffer(React.createElement(InvoicePDF, { invoice }));
}
