# Copilot Chat Conversation Export: MarketMaster ERP integration with URA EFRIS

**User:** @FarhanSabit
**Thread URL:** https://github.com/copilot/c/3874546c-c2d3-467d-81b0-5ca3e9474441

## @FarhanSabit

Analyze the Repositories & Give step by step instructions on Integrating URA-EFRIS in a Multi-vendor, Market & Revenue Management System. Core Focus: The Market Gate Flow (Entry Gate Counter->Stock Counter->Exit Gate Counter) while PO is being Delivered by a Supplier to the Market (Single or Multiple Vendor/Market Member/Shop) & In between, VAT/TAX + PO Payment For the Delivered Goods.
Then, Shop Rent Payment, Customer Payment to Shop for Purchasing an Item etc.
Market Admin Tracks, Takes Actions & Reminds Dues, Facilitate URA-MMIS Communication (Invoicing & Receipt) etc.
We need to Answer:
1. How The Payment from a Vendor or Multiple Vendor is processed from start to end.
2. Where does the Payment Go? Because Rent should be received by someone or some organization & VAT/TAX is due to URA.
3. What is the benefit of the MMIS Platform? What do we get as a Centralized Platform for Nation-wide Market, Stock/Inventory & Revenue Management System for Uganda?
4. & Similar Questions like,
       "How to become an aggregator of URA? How to Integrate EFRIS? If we integrate Efris do we avoid becoming an aggregator? what are the pros & cons of becoming/not becoming an aggregator?"
       "How does the system handle partial payments and instalments?
What happens on gateway failure (retry + fallback)?
How are refunds processed with EFRIS reversal?
Can Market Master configure different commission rates per payment gateway?
How does offline payment (cash at counter) get reconciled with EFRIS?"
Give Code Example for Our System "Marketmastererp & Marketmasterapi"

## Copilot

I'll analyze the repositories you've provided and create comprehensive step-by-step instructions for integrating URA-EFRIS into a multi-vendor market and revenue management system. Let me start by examining the repository structures and existing code.Now let me search for more specific implementation details in these repositories:Now let me search for more specific information about the URA EFRIS SDK implementation details:Now let me compile a comprehensive guide with code examples for your MarketMaster system:

---

# **URA EFRIS Integration Guide for MarketMasterERP**
## Multi-Vendor Market & Revenue Management System (Uganda)

---

## **Executive Summary**

This document provides **step-by-step integration instructions** for connecting MarketMasterERP with the **URA EFRIS System**, focusing on the **Market Gate Flow** (Entry Gate → Stock Counter → Exit Gate Counter) during supplier PO deliveries, with full payment and tax reconciliation.

---

## **Table of Contents**

1. [Architecture Overview](#architecture-overview)
2. [Payment Flow Explained](#payment-flow-explained)
3. [Where Payments Go](#where-payments-go)
4. [Benefits of MMIS Platform](#benefits-of-mmis-platform)
5. [Becoming a URA Aggregator](#becoming-a-ura-aggregator)
6. [Advanced Payment Scenarios](#advanced-payment-scenarios)
7. [Code Examples for MarketMasterERP](#code-examples)
8. [Implementation Roadmap](#implementation-roadmap)

---

## **1. Architecture Overview** {#architecture-overview}

### **System Components**

```
┌─────────────────────────────────────────────────────────────────┐
│                    MarketMasterERP Platform                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Gate Entry  │  │   Supplier   │  │  Payment Gateway     │  │
│  │   (QR Scan)  │  │  PO + Stock  │  │ (MTN/Airtel/Bank)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────────┘  │
│         │                 │                  │                  │
│         ├─────────────────┼──────────────────┤                  │
│         │                 ↓                  │                  │
│         │           ┌──────────────┐         │                  │
│         │           │  MarketMaster│         │                  │
│         └──────────→│  Payment Hub │←────────┘                  │
│                     │ (Transaction │                            │
│                     │  Processor)  │                            │
│                     └──────┬───────┘                            │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         ↓                  ↓                  ↓                 │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐             │
│   │   Rent   │      │   VAT/   │      │  Vendor  │             │
│   │  Wallet  │      │   TAX    │      │  Wallet  │             │
│   │          │      │  (URA)   │      │          │             │
│   └──────────┘      └──────────┘      └──────────┘             │
│         │                  │                 │                 │
│         └──────────────────┼─────────────────┘                 │
│                            ↓                                    │
│                    ┌──────────────┐                            │
│                    │   EFRIS S2S  │                            │
│                    │ (URA System) │                            │
│                    └──────────────┘                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### **Key Players**

| Entity | Role | Account | Module |
|--------|------|---------|--------|
| **Market Admin** | Platform Operator | Centralized Revenue Collection | Admin Dashboard |
| **Vendor/Shop Owner** | Product Seller | Individual Shop Wallet | Vendor Portal |
| **Supplier** | Goods Provider | Wallet for Payments | Supplier Portal |
| **Gate/Stock Staff** | QR Verifiers | Entry/Exit Loggers | Gate Portal |
| **URA** | Tax Authority | VAT/Tax Collection | EFRIS Integration |
| **Payment Gateway** | Transaction Processor | Multiple payment methods | API Bridge |

---

## **2. Payment Flow Explained** {#payment-flow-explained}

### **Complete Transaction Journey**

#### **Scenario: Supplier Delivers 100 Units of Sugar to Market**

```
Step 1: Requisition Created
└─ Vendor (Shop) requests goods from Supplier
   Requisition ID: REQ-2026-04-22-001
   Items: 100 bags of sugar @ UGX 5,000/bag
   Budget: UGX 500,000

Step 2: Bidding & AI Trust Score
└─ Supplier bids: UGX 450,000 (10% discount)
   AI Trust Score: 8.5/10 (Rating + History)
   Status: ACCEPTED
   Escrow Status: Funds LOCKED in platform

Step 3: Entry Gate Phase
├─ Supplier vehicle arrives at market
├─ Gate Staff scans delivery QR (auto-generated from bid)
├─ System captures:
│  ├─ Vehicle Plate: UB 123 XY
│  ├─ Driver: John Mukasa
│  ├─ Entry Time: 2026-04-22 09:30:00 (EAT)
│  ├─ Goods Value: UGX 450,000
│  ├─ Gate Fee (Parking): UGX 10,000
│  └─ VAT on Gate Fee: UGX 1,500
│
├─ Payment Flows:
│  ├─ Gate Fee Paid: UGX 10,000 → Market Rent Wallet
│  └─ VAT: UGX 1,500 → URA (EFRIS Queue)
│
└─ Entry Token Generated (Valid for 2 hours)

Step 4: Stock Counter Phase
├─ Stock Verifiers inspect goods
├─ QR scan at stock counter confirms:
│  ├─ Item Counts match
│  ├─ Quality inspected
│  └─ System logs: VERIFIED ✓
│
└─ Stock tracking updated in system

Step 5: Exit Gate Phase
├─ After goods unloaded at shop
├─ Gate Staff scans exit QR
├─ System calculates:
│  ├─ Duration: 1 hour 45 minutes
│  ├─ Overstay: None (within 2-hour limit)
│  └─ Exit Fee: UGX 0
│
├─ Payment Finalized
│  ├─ Escrow Released: UGX 450,000 → Shop Wallet
│  │  └─ (Used to cover PO cost)
│  ├─ Supplier Wallet Debited: UGX 450,000
│  │  └─ (Payment for delivered goods)
│  └─ Transaction Status: COMPLETED
│
└─ Exit Token Generated

Step 6: VAT/TAX Reconciliation
├─ Total VAT for this transaction: UGX 1,500
├─ Submitted to EFRIS via S2S API:
│  ├─ Transaction ID: TXN-2026-04-22-001
│  ├─ Amount: UGX 450,000
│  ├─ Tax Collected: UGX 1,500 (0.33%)
│  ├─ Invoice Number: URA-EFRIS-2026-04-22-001
│  └─ QR Code: [Fiscal QR Generated by URA]
│
└─ Receipt issued with URA fiscal stamp

Step 7: Payment Remittance
└─ End of Day Settlement:
   ├─ Market Rent Collection: UGX 10,000 (Gate fee)
   ├─ VAT Remittance to URA: UGX 1,500
   ├─ Vendor Settlement: Goods cost deducted from escrow
   ├─ Supplier Payout: Pending (next withdrawal cycle)
   └─ Reconciliation Report: Generated & Sent to Admin
```

---

## **3. Where Payments Go** {#where-payments-go}

### **Payment Distribution Table**

| Payment Type | Amount | Destination | Purpose | Frequency |
|--------------|--------|-------------|---------|-----------|
| **Shop Rent** | Monthly rate (e.g., UGX 200,000) | Market Admin/Landlord | Market Operations | Monthly |
| **Gate Fee** | UGX 10,000/entry | Market Rent Wallet | Parking/Infrastructure | Per Entry |
| **VAT on Transactions** | 0-18% (as applicable) | URA (via EFRIS) | Tax Compliance | Real-time |
| **Overstay Fee** | UGX 2,000/30min | Market Admin | Penalty/Enforcement | Ad-hoc |
| **PO Cost** | Goods value | Supplier Wallet → Vendor Account | Goods Delivery Payment | Per Requisition |
| **Commission** | 1-2% (configurable) | Market Admin | Platform Fee | Per Transaction |
| **Levy (Market Improvement)** | 1% (optional) | Market Development Fund | Infrastructure Upgrade | Per Transaction |

### **Wallet Architecture**

```typescript
// MarketMaster Wallet Model

interface MultiWalletSystem {
  // Market Admin Level
  marketAdminWallet: {
    rentCollection: number;      // From shop rents
    gateFeesCollection: number;  // Parking fees
    commissionsEarned: number;   // % on transactions
    leviesCollection: number;    // Market improvement fund
    totalBalance: number;
  };

  // Vendor Level
  vendorWallet: {
    id: string;
    vendorId: string;
    balance: number;              // Available funds
    escrowHold: number;           // Locked for POs
    pendingPayment: number;       // Awaiting payment
    lockedForRent: number;        // Rent advance
    transactions: Transaction[];
  };

  // Supplier Level
  supplierWallet: {
    id: string;
    supplierId: string;
    balance: number;              // Available funds
    commissionEarned: number;     // From fulfilled requisitions
    pendingPayout: number;        // Awaiting settlement
    transactions: Transaction[];
  };

  // URA Tax Wallet
  uraTaxWallet: {
    vatCollected: number;         // VAT/Tax aggregated
    lastRemittanceDate: string;
    nextRemittanceDate: string;
    status: 'PENDING' | 'REMITTED' | 'AUDIT';
  };
}
```

---

## **4. Benefits of MMIS Platform** {#benefits-of-mmis-platform}

### **For Market Admins**

✅ **Centralized Revenue Management**
- Real-time visibility of all collections (rent, fees, VAT)
- Automated reminders for overdue payments
- Dashboard analytics for cash flow forecasting

✅ **Vendor Accountability**
- Complete audit trail of every transaction
- AI-powered trust scoring for vendors
- Instant suspension for non-compliant players

✅ **URA Compliance**
- Automated VAT/TAX calculation and remittance
- EFRIS integration ensures 100% tax accuracy
- Digital audit logs for regulatory audits

✅ **Operational Efficiency**
- Gate automation reduces manual queues
- Stock verification via QR codes (no lost items)
- AI chatbot for vendor support

### **For Vendors**

✅ **Transparent Pricing**
- Know exact rent, VAT, and commission upfront
- No hidden charges
- Payment history with receipts

✅ **Payment Flexibility**
- Multiple payment methods (MTN, Airtel, Bank, Cash)
- Installment options for large purchases
- Automatic billing notifications

✅ **Fair Competition**
- Trust score-based supplier matching
- Competitive bidding system
- Access to nation-wide supplier network

### **For Suppliers**

✅ **Market Access**
- Direct visibility to all market requisitions
- No intermediaries; direct-to-shop delivery
- AI-based bid recommendation engine

✅ **Financial Security**
- Escrow protection (payment held until delivery verified)
- Timely settlements via wallet system
- Reduced default risk

### **For Uganda (Nation-wide Impact)**

✅ **Tax Compliance**
- 18% VAT collection automated
- Real-time reporting to URA
- Reduction in tax evasion in informal markets

✅ **Market Formalization**
- All vendors registered and traceable
- KYC/AML compliance built-in
- Enables targeted government support programs

✅ **Data-Driven Policy Making**
- Aggregate market insights (e.g., inflation trends)
- Gender-based analytics (women vendor support)
- Regional market performance comparisons

✅ **Employment Potential**
- Creates jobs for gate staff, stock verifiers
- Supplier logistics coordination
- Platform maintenance & support roles

---

## **5. Becoming a URA Aggregator** {#becoming-a-ura-aggregator}

### **Key Question: "How to Become an Aggregator & Avoid It?"**

#### **Option A: Become a URA Aggregator (RECOMMENDED)**

**What It Means:**
- Your platform (MarketMaster) acts as a **Virtual Sales Data Controller (VSDC)** or **Sales Data Collector (SDC)**
- You submit ALL transactions on behalf of your vendors to EFRIS
- URA considers **you** the primary tax filer, and vendors are secondary

**Pros:**
✅ Centralized tax compliance (simpler for vendors)
✅ Real-time EFRIS integration (single point of submission)
✅ Reduced vendor burden → Better platform adoption
✅ Authority recognition (URA official status)
✅ Scalability (easier to add new vendors)
✅ Data quality control (platform handles verification)

**Cons:**
❌ Legal responsibility for tax accuracy rests with YOU
❌ URA audits target your platform first
❌ Complex compliance requirements
❌ Higher operational costs
❌ EFRIS device registration required at platform level

**Process:**
1. **Register with URA:**
   - Obtain a TIN for your company
   - Submit application as **VSDC/SDC**
   - Provide business plan & technical architecture docs

2. **Get EFRIS Credentials:**
   - Request S2S API access
   - Install EFRIS device (hardware token) at your data center
   - Download EFRIS SDK/API documentation

3. **Technical Setup:**
   - Integrate URA-EFRIS-JS-SDK into MarketMasterApi
   - Implement real-time invoice submission
   - Set up offline queue system
   - Configure error handling & retry logic

4. **Compliance Verification:**
   - URA conducts platform audit
   - Verify encryption & data security
   - Test end-to-end submission workflow
   - Obtain approval certificate

**Timeline:** 4-8 weeks

---

#### **Option B: Each Vendor Registers Individually (NOT RECOMMENDED)**

**What It Means:**
- Each vendor gets their own EFRIS registration
- Vendors submit their transactions directly to EFRIS (with your support)
- Your platform is just a facilitator

**Pros:**
✅ Vendors have direct URA relationship
✅ Lower regulatory burden on you
✅ Vendors own their tax compliance

**Cons:**
❌ Fragmented system (vendors do separate integrations)
❌ High vendor burden (requires EFRIS knowledge)
❌ Poor platform adoption
❌ Inconsistent data quality
❌ Higher support costs
❌ Harder to scale to 1000+ vendors

**Why Not Choose This?**
For a platform with 100-1000+ vendors, individual registration is impractical. Vendors lack technical skills; adoption rates collapse.

---

### **Recommendation for MarketMaster**

🎯 **Become a URA Aggregator (VSDC/SDC)**

This is the **only viable path** for a centralized market management system targeting Uganda. It positions MarketMaster as:
- The authoritative tax reporting entity
- A trustworthy partner for URA
- A scalable platform for all markets nationwide

---

### **Benefits of Becoming an Aggregator**

| Aspect | Aggregator | Non-Aggregator |
|--------|-----------|-----------------|
| **EFRIS Submissions** | Centralized (1 integration) | Fragmented (100+ integrations) |
| **Tax Accuracy** | High (platform controls) | Variable (vendor-dependent) |
| **Vendor Burden** | Low (automatic) | High (manual process) |
| **Scalability** | Linear (easy to add vendors) | Exponential (complex) |
| **URA Audits** | Single point (you) | Multiple points (all vendors) |
| **Market Adoption** | High (simple for vendors) | Low (complex for vendors) |
| **Legal Risk** | You are liable | Shared (distributed) |
| **Revenue Opportunity** | Commission on compliance | Minimal |

---

### **Aggregator Comparison Matrix**

```
AGGREGATOR STATUS
─────────────────

You: MarketMaster (Aggregator)
├─ Register with URA (TIN: XXXXXXXXXXXX)
├─ Request VSDC/SDC Status
├─ Get EFRIS S2S API Credentials
├─ Install Hardware Token (EFRIS Device)
└─ Integrate SDK (ura-efris-js-sdk)

Vendors: Your Vendors (Sub-Taxpayers)
├─ Register KYC with MarketMaster
├─ Provide TIN to MarketMaster
├─ Automatic EFRIS submission via your platform
└─ Receive fiscal receipts in real-time

URA: Uganda Revenue Authority
├─ Tracks: All transactions via MarketMaster
├─ Audits: Your platform (not individual vendors)
├─ Collects: VAT/Tax in real-time
└─ Issues: Fiscal documents via your platform
```

---

## **6. Advanced Payment Scenarios** {#advanced-payment-scenarios}

### **Scenario 1: Partial Payments & Installments**

```
PROBLEM:
A vendor cannot pay full rent (UGX 200,000) in one transaction.
They want to pay in 2 installments of UGX 100,000 each.

SOLUTION IN MARKETMASTER:

Flow:
1. Vendor initiates rent payment for UGX 200,000
2. System creates 2 installment records:
   ├─ Installment 1: UGX 100,000 (Due: 2026-05-01)
   └─ Installment 2: UGX 100,000 (Due: 2026-06-01)

3. Vendor pays Installment 1 via MTN MoMo
   └─ Status: PARTIAL (Installment 1 PAID, Installment 2 PENDING)

4. Automated reminder sent 3 days before Installment 2 due date

5. On 2026-06-01, if not paid:
   └─ Status: OVERDUE, Late fee accrues (2% per week)

6. Vendor pays Installment 2
   └─ Status: PAID (Full rent settled)

7. EFRIS Records:
   ├─ Transaction 1: UGX 100,000 + VAT (2026-05-XX)
   └─ Transaction 2: UGX 100,000 + VAT (2026-06-XX)
```

**Code Example:**

```typescript
// services/paymentService.ts in MarketMasterApi

interface InstallmentPlan {
  id: string;
  rentPaymentId: string;
  vendorId: string;
  totalAmount: number;
  installments: Array<{
    id: string;
    number: number;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    paymentDate?: string;
    transactionId?: string;
    lateFee?: number;
  }>;
}

async function createInstallmentPlan(
  rentPaymentId: string,
  totalAmount: number,
  numberOfInstallments: number
): Promise<InstallmentPlan> {
  const installmentAmount = totalAmount / numberOfInstallments;
  const today = new Date();
  
  const installments = Array.from({ length: numberOfInstallments }, (_, i) => ({
    id: generateUUID(),
    number: i + 1,
    amount: installmentAmount,
    dueDate: addMonths(today, i + 1).toISOString(),
    status: 'PENDING' as const,
  }));

  return await db.installmentPlan.create({
    data: {
      id: generateUUID(),
      rentPaymentId,
      totalAmount,
      installments,
    },
  });
}

async function recordInstallmentPayment(
  installmentId: string,
  transactionId: string,
  method: PaymentMethod
): Promise<void> {
  // Update installment status
  await db.installment.update({
    where: { id: installmentId },
    data: {
      status: 'PAID',
      paymentDate: new Date(),
      transactionId,
    },
  });

  // Check if all installments paid
  const plan = await db.installmentPlan.findUnique({
    where: { id: installmentId },
    include: { installments: true },
  });

  const allPaid = plan.installments.every(inst => inst.status === 'PAID');
  
  if (allPaid) {
    // Update parent rent payment to PAID
    await db.rentPayment.update({
      where: { id: plan.rentPaymentId },
      data: { status: 'PAID' },
    });

    // Submit to EFRIS
    await submitToEFRIS({
      type: 'RENT',
      amount: plan.totalAmount,
      vendorId: plan.vendorId,
      transactionDate: new Date(),
      method,
    });
  }
}
```

---

### **Scenario 2: Gateway Failure & Retry with Fallback**

```
PROBLEM:
Vendor tries to pay rent via MTN MoMo.
MTN gateway is DOWN.
System should:
1. Retry 3 times
2. Fall back to alternative gateway (Airtel)
3. Alert admin if all fail

FLOW:

1. Vendor initiates payment: UGX 100,000 via MTN
   └─ Status: PROCESSING

2. First attempt to MTN (Retry 1):
   ├─ Request sent at 09:00
   ├─ Timeout after 10 seconds
   └─ Result: FAILED

3. Retry logic:
   ├─ Retry 1 (09:01): FAILED (MTN still down)
   ├─ Retry 2 (09:02): FAILED
   └─ Retry 3 (09:03): FAILED

4. Fallback triggered:
   ├─ Send notification to vendor: "MTN unavailable, try Airtel"
   ├─ Vendor clicks: "Use Airtel Money"
   └─ New attempt with Airtel gateway

5. Airtel attempt (Retry 1):
   ├─ Request sent at 09:05
   ├─ Response: SUCCESS
   └─ Payment confirmed: UGX 100,000

6. Admin notification:
   ├─ Alert: "Payment succeeded via fallback (Airtel)"
   ├─ Original gateway: MTN (FAILED)
   └─ Final status: PAID

7. EFRIS submission:
   └─ Single transaction record (success via Airtel)
```

**Code Example:**

```typescript
// services/paymentGatewayService.ts

interface PaymentAttempt {
  id: string;
  transactionId: string;
  gateway: PaymentGateway;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRY';
  attempts: Array<{
    attemptNumber: number;
    timestamp: string;
    result: string;
    error?: string;
  }>;
}

const PAYMENT_GATEWAYS = ['MTN', 'AIRTEL', 'BANK_TRANSFER'] as const;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

async function processPaymentWithFallback(
  vendorId: string,
  amount: number,
  primaryGateway: PaymentGateway,
  fallbackGateways: PaymentGateway[]
): Promise<{ success: boolean; gateway: PaymentGateway; txId: string }> {
  
  const allGateways = [primaryGateway, ...fallbackGateways];
  
  for (const gateway of allGateways) {
    console.log(`🔄 Attempting payment via ${gateway}...`);
    
    let lastError: string | null = null;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await getGatewayHandler(gateway).process({
          amount,
          vendorId,
          timeout: 10000,
        });

        if (result.success) {
          console.log(`✅ Payment SUCCESS via ${gateway}`);
          
          // Record successful transaction
          await recordTransaction({
            vendorId,
            amount,
            gateway,
            status: 'SUCCESS',
            transactionId: result.txId,
          });

          // Submit to EFRIS
          await submitToEFRIS({
            type: 'PAYMENT',
            amount,
            vendorId,
            gateway,
            transactionId: result.txId,
          });

          return { success: true, gateway, txId: result.txId };
        }
      } catch (error: any) {
        lastError = error.message;
        console.warn(`❌ Attempt ${attempt} failed on ${gateway}: ${error.message}`);
        
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS);
        }
      }
    }
    
    console.warn(`⚠️ All retries failed for ${gateway}`);
    
    // If primary gateway fails completely, try fallback
    if (gateway === primaryGateway && fallbackGateways.length > 0) {
      console.log(`🔀 Switching to fallback gateway: ${fallbackGateways[0]}`);
      await notifyVendor(vendorId, {
        title: 'Payment Gateway Issue',
        message: `${primaryGateway} is unavailable. Please try ${fallbackGateways[0]}.`,
        action: 'retry_with_fallback',
      });
      continue;
    }
  }
  
  // All gateways exhausted
  console.error('❌ All payment gateways failed');
  await notifyAdmin({
    alert: 'CRITICAL',
    message: `Payment failed for vendor ${vendorId} (UGX ${amount}). All gateways exhausted.`,
    vendorId,
    amount,
  });
  
  throw new Error('All payment gateways failed. Please try again later.');
}

// Usage:
await processPaymentWithFallback(
  vendorId,
  100000,
  'MTN_MOMO',
  ['AIRTEL_MONEY', 'BANK_TRANSFER']
);
```

---

### **Scenario 3: EFRIS Reversal & Refunds**

```
PROBLEM:
Customer refunds a purchase.
EFRIS already issued a fiscal receipt.
System must:
1. Generate reversal in EFRIS (debit note)
2. Reverse VAT collection
3. Process refund to customer

FLOW:

1. Sale recorded in EFRIS:
   ├─ Invoice #: URA-EFRIS-2026-04-22-001
   ├─ Amount: UGX 118,000 (including 18% VAT)
   ├─ VAT: UGX 18,000
   └─ Status: COMPLETE

2. Customer returns goods:
   ├─ Reason: Defective items
   ├─ Refund requested: Full (UGX 118,000)
   └─ Admin approves refund

3. Generate EFRIS Debit Note (Reversal):
   ├─ Original Invoice: URA-EFRIS-2026-04-22-001
   ├─ Debit Note: URA-EFRIS-2026-04-22-001-REV
   ├─ Amount: -UGX 118,000
   ├─ VAT Reversal: -UGX 18,000
   └─ Reason: "Customer return - Defective goods"

4. Submit reversal to EFRIS:
   ├─ API Call: POST /efris/debit-note
   ├─ Payload: Debit note data + digital signature
   └─ Response: EFRIS-issued reversal receipt

5. Process refund:
   ├─ Refund amount: UGX 118,000
   ├─ Gateway: Original payment method (if <30 days)
   ├─ Status: PENDING SETTLEMENT
   └─ Timeline: 3-5 business days

6. Update tax records:
   ├─ VAT reversal: -UGX 18,000
   ├─ Tax wallet: Updated
   ├─ Next URA remittance: Includes reversal
   └─ Audit log: Complete reversal trail
```

**Code Example:**

```typescript
// services/refundService.ts

interface RefundRequest {
  id: string;
  originalTransactionId: string;
  reason: 'DEFECTIVE' | 'RETURN' | 'DUPLICATE' | 'DISPUTE';
  amount: number;
  vendorId: string;
  status: 'PENDING' | 'APPROVED' | 'REVERSED' | 'REFUNDED';
}

async function processRefundWithEFRISReversal(
  refundRequest: RefundRequest
): Promise<void> {
  // Step 1: Validate original transaction
  const originalTx = await db.transaction.findUnique({
    where: { id: refundRequest.originalTransactionId },
  });

  if (!originalTx) {
    throw new Error('Original transaction not found');
  }

  // Step 2: Check if eligible for refund (within 30 days)
  const daysOld = daysSince(originalTx.date);
  if (daysOld > 30) {
    throw new Error('Refund window expired (>30 days)');
  }

  // Step 3: Generate EFRIS debit note
  const debitNote = {
    id: generateUUID(),
    originalInvoiceNumber: originalTx.efrisInvoiceNumber,
    debitNoteNumber: `${originalTx.efrisInvoiceNumber}-REV`,
    amount: -refundRequest.amount,
    vatAmount: -(refundRequest.amount * 0.18),
    reason: refundRequest.reason,
    timestamp: new Date().toISOString(),
    vendorTIN: originalTx.vendorTIN,
  };

  // Step 4: Submit debit note to EFRIS
  const efrisResponse = await submitToEFRIS({
    type: 'DEBIT_NOTE',
    data: debitNote,
  });

  if (!efrisResponse.success) {
    throw new Error(`EFRIS submission failed: ${efrisResponse.error}`);
  }

  // Step 5: Update tax records (reverse VAT)
  await db.taxWallet.update({
    where: { id: originalTx.taxWalletId },
    data: {
      vatCollected: {
        decrement: Math.abs(debitNote.vatAmount),
      },
    },
  });

  // Step 6: Create refund transaction
  const refundTx = await db.transaction.create({
    data: {
      id: generateUUID(),
      vendorId: refundRequest.vendorId,
      type: 'REFUND',
      amount: refundRequest.amount,
      status: 'PENDING',
      method: originalTx.method, // Use original payment method
      reference: debitNote.debitNoteNumber,
      efrisInvoiceNumber: efrisResponse.debitNoteNumber,
      linkedTransactionId: originalTx.id,
    },
  });

  // Step 7: Initiate refund to customer
  await processRefundToGateway({
    gateway: originalTx.method,
    amount: refundRequest.amount,
    originalTransactionId: originalTx.gatewayTransactionId,
    refundTransactionId: refundTx.id,
  });

  // Step 8: Send notifications
  await notifyVendor(refundRequest.vendorId, {
    title: 'Refund Processed',
    message: `Refund of UGX ${refundRequest.amount} initiated. Expected in 3-5 business days.`,
  });

  await notifyAdmin({
    alert: 'INFO',
    message: `Refund processed: ${refundRequest.id} (EFRIS Debit Note: ${debitNote.debitNoteNumber})`,
  });
}
```

---

### **Scenario 4: Cash Payment at Counter & Offline Reconciliation**

```
PROBLEM:
Market operates in areas with intermittent internet.
Vendors pay rent in CASH at the counter.
System must:
1. Record cash payment offline
2. Queue for EFRIS when online
3. Reconcile cash drawer at end of day

FLOW:

OFFLINE MODE:
1. Vendor arrives with UGX 200,000 (rent payment)
2. Admin logs into MarketMaster (offline app)
3. Creates payment record:
   ├─ Vendor ID: V-001
   ├─ Amount: UGX 200,000
   ├─ Method: CASH
   ├─ Timestamp: 2026-04-22 14:30:00
   └─ Status: PENDING_SYNC (stored locally)

4. Issue manual receipt:
   ├─ Receipt #: RCP-2026-04-22-001
   ├─ Note: "OFFLINE - Will sync when online"
   └─ Handwritten: Admin signature

5. Local database records:
   └─ payments.db (SQLite on offline device)
      └─ payment_id: offline_pay_001
      └─ sync_status: PENDING
      └─ local_timestamp: 2026-04-22 14:30:00

ONLINE MODE (Next Morning):
6. Device comes online at 08:00
7. App detects pending transactions:
   └─ Found: 15 offline cash payments (total: UGX 3,000,000)

8. Sync to MarketMasterApi:
   ├─ Send batch: [payment1, payment2, ..., payment15]
   ├─ Server validates all payments
   ├─ Server calculates VAT for each:
   │  └─ Cash payment VAT: 0% (cash transactions often exempted or special rate)
   └─ Server creates master transactions

9. VAT Submission to EFRIS:
   ├─ Aggregate all 15 payments
   ├─ Total VAT: UGX 45,000 (if applicable)
   ├─ Submit to EFRIS: Single batch transaction
   └─ Receive: EFRIS confirmation + fiscal receipt

10. Cash Drawer Reconciliation:
    ├─ Expected cash: UGX 3,000,000
    ├─ Actual counted: UGX 2,998,500
    ├─ Variance: UGX 1,500 (0.05% - acceptable)
    ├─ Discrepancy recorded
    └─ Status: RECONCILED
```

**Code Example:**

```typescript
// services/offlinePaymentService.ts

interface OfflinePayment {
  id: string;
  vendorId: string;
  amount: number;
  method: 'CASH' | 'CHEQUE';
  localTimestamp: string; // Device local time
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
  receiptNumber?: string;
  adminName: string;
  notes?: string;
}

// OFFLINE: Save payment locally (SQLite)
async function recordOfflinePayment(
  payment: Omit<OfflinePayment, 'id'>
): Promise<OfflinePayment> {
  const offlinePayment: OfflinePayment = {
    id: generateUUID(),
    ...payment,
    status: 'PENDING_SYNC',
  };

  // Store in local SQLite database
  await localDB.payments.insert(offlinePayment);

  // Generate receipt
  const receipt = generateReceipt({
    receiptNumber: `RCP-${new Date().toISOString().split('T')[0]}-${generateSequence()}`,
    payment: offlinePayment,
    status: 'OFFLINE - SYNC PENDING',
  });

  return offlinePayment;
}

// ONLINE: Sync pending payments
async function syncOfflinePayments(): Promise<{ synced: number; failed: number }> {
  // Step 1: Fetch all pending payments from local DB
  const pendingPayments = await localDB.payments.findMany({
    where: { status: 'PENDING_SYNC' },
  });

  if (pendingPayments.length === 0) {
    console.log('✅ No pending payments to sync');
    return { synced: 0, failed: 0 };
  }

  console.log(`🔄 Syncing ${pendingPayments.length} offline payments...`);

  let syncedCount = 0;
  let failedCount = 0;

  // Step 2: Send batch to backend
  try {
    const response = await api.post('/payments/sync-offline', {
      payments: pendingPayments,
    });

    if (response.data.success) {
      console.log(`✅ Sync successful: ${response.data.syncedCount} payments`);

      // Step 3: Mark as synced in local DB
      await localDB.payments.updateMany(
        { id: { $in: pendingPayments.map(p => p.id) } },
        { status: 'SYNCED' }
      );

      syncedCount = response.data.syncedCount;
    }
  } catch (error) {
    console.error('❌ Sync failed:', error);
    failedCount = pendingPayments.length;
  }

  return { synced: syncedCount, failed: failedCount };
}

// BACKEND: Process synced offline payments
async function processSyncedOfflinePayments(
  payments: OfflinePayment[]
): Promise<{ syncedCount: number; efrisSubmitted: boolean }> {
  const batch = [];

  for (const payment of payments) {
    // Validate vendor still exists
    const vendor = await db.vendor.findUnique({
      where: { id: payment.vendorId },
    });

    if (!vendor) {
      console.warn(`Vendor ${payment.vendorId} not found, skipping`);
      continue;
    }

    // Create transaction record
    const tx = await db.transaction.create({
      data: {
        id: generateUUID(),
        vendorId: payment.vendorId,
        type: 'RENT',
        amount: payment.amount,
        method: payment.method,
        status: 'PAID',
        reference: payment.receiptNumber,
        metadata: {
          offlineLocalTime: payment.localTimestamp,
          syncedAt: new Date().toISOString(),
          adminName: payment.adminName,
        },
      },
    });

    batch.push(tx);
  }

  // Step 4: Submit to EFRIS (if online)
  const efrisSubmitted = await submitBatchToEFRIS(batch);

  return {
    syncedCount: batch.length,
    efrisSubmitted,
  };
}

// Cash Drawer Reconciliation
async function reconcileCashDrawer(expectedAmount: number): Promise<{
  expected: number;
  actual: number;
  variance: number;
  variancePercent: number;
  status: 'RECONCILED' | 'VARIANCE_FLAGGED';
}> {
  // Query all cash payments for the day
  const todayPayments = await db.transaction.findMany({
    where: {
      method: 'CASH',
      date: { gte: startOfDay(new Date()) },
    },
  });

  const totalRecorded = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const variance = expectedAmount - totalRecorded;
  const variancePercent = (variance / expectedAmount) * 100;

  return {
    expected: totalRecorded,
    actual: expectedAmount,
    variance,
    variancePercent,
    status: Math.abs(variancePercent) < 1 ? 'RECONCILED' : 'VARIANCE_FLAGGED',
  };
}
```

---

### **Scenario 5: Multi-Rate Commission & Dynamic Configuration**

```
PROBLEM:
Different markets have different commission structures:
- Kampala Central Market: 2% commission
- Mbarara Market: 1.5% commission
- Masaka Market: 1% commission

Admin should configure per-market rates.

SOLUTION:

Configuration:
┌─────────────────────────────────────────┐
│      Market Commission Config           │
├─────────────────────┬───────────────────┤
│ Market              │ Commission Rate   │
├─────────────────────┼───────────────────┤
│ Kampala Central     │ 2.0%              │
│ Mbarara Market      │ 1.5%              │
│ Masaka Market       │ 1.0%              │
│ Jinja Market        │ 1.75%             │
└─────────────────────┴───────────────────┘

Transaction Example:
├─ Vendor: Ahmed (Kampala Central Market)
├─ Sale Amount: UGX 100,000
├─ Commission Rate (from config): 2.0%
├─ Commission: UGX 2,000
├─ Net to Vendor: UGX 98,000
├─ Commission to Admin: UGX 2,000
└─ EFRIS records: UGX 100,000 (commission already deducted)
```

**Code Example:**

```typescript
// services/commissionService.ts

interface MarketCommissionConfig {
  marketId: string;
  commissionRate: number; // Percentage (e.g., 2.0)
  effectiveDate: string;
  createdBy: string;
}

// Get commission config for market
async function getMarketCommissionRate(marketId: string): Promise<number> {
  const config = await db.marketCommissionConfig.findFirst({
    where: {
      marketId,
      effectiveDate: { lte: new Date() },
    },
    orderBy: { effectiveDate: 'desc' },
  });

  return config?.commissionRate ?? 1.5; // Default 1.5%
}

// Calculate transaction with commission
async function calculateTransactionWithCommission(
  marketId: string,
  saleAmount: number
): Promise<{
  gross: number;
  commissionRate: number;
  commission: number;
  net: number;
}> {
  const commissionRate = await getMarketCommissionRate(marketId);
  const commission = (saleAmount * commissionRate) / 100;
  const net = saleAmount - commission;

  return {
    gross: saleAmount,
    commissionRate,
    commission,
    net,
  };
}

// Admin function: Update commission rate
async function updateMarketCommissionRate(
  marketId: string,
  newRate: number,
  adminId: string
): Promise<void> {
  if (newRate < 0 || newRate > 10) {
    throw new Error('Commission rate must be between 0-10%');
  }

  await db.marketCommissionConfig.create({
    data: {
      id: generateUUID(),
      marketId,
      commissionRate: newRate,
      effectiveDate: new Date(),
      createdBy: adminId,
    },
  });

  console.log(`✅ Commission rate updated for ${marketId} to ${newRate}%`);
}
```

---

## **7. Code Examples for MarketMasterERP** {#code-examples}

### **A. Complete Payment Flow Integration (Backend)**

```typescript
// src/payment-flow/paymentFlowIntegration.ts
// MarketMasterApi - Complete payment orchestration

import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { uraclient } from '../integrations/ura-efris';
import { paymentGateway } from '../integrations/payment-gateway';

const router = Router();

// ============================================
// 1. CREATE PAYMENT OBLIGATION (e.g., Monthly Rent)
// ============================================

interface CreateRentObligationRequest {
  vendorId: string;
  amount: number;
  periodStart: string; // ISO date
  periodEnd: string;   // ISO date
  dueDate: string;     // ISO date
}

router.post('/payments/rent/create-obligation', async (req: Request, res: Response) => {
  try {
    const { vendorId, amount, periodStart, periodEnd, dueDate } = req.body as CreateRentObligationRequest;

    // Validate vendor
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res.status(404).json({ success: false, error: 'Vendor not found' });
    }

    // Create rent payment obligation
    const rentPayment = await prisma.rentPayment.create({
      data: {
        id: generateUUID(),
        vendorId,
        amount,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        dueDate: new Date(dueDate),
        status: 'PENDING',
        gracePeriodDays: 5,
      },
    });

    // Send notification to vendor
    await sendNotification(vendorId, {
      title: 'Rent Due',
      message: `Your rent of UGX ${amount} is due by ${dueDate}`,
      actionUrl: `/vendor/payments/${rentPayment.id}`,
    });

    res.json({
      success: true,
      data: rentPayment,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 2. PROCESS PAYMENT (Multi-Gateway Support)
// ============================================

interface ProcessPaymentRequest {
  rentPaymentId: string;
  amount: number;
  method: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK' | 'CASH';
  phoneNumber?: string;
  bankAccountNumber?: string;
  transactionReference?: string;
}

router.post('/payments/process', async (req: Request, res: Response) => {
  try {
    const { rentPaymentId, amount, method, phoneNumber, transactionReference } = req.body as ProcessPaymentRequest;
    const vendorId = req.user.id; // From JWT

    // Get rent payment
    const rentPayment = await prisma.rentPayment.findUnique({
      where: { id: rentPaymentId },
      include: { vendor: true },
    });

    if (!rentPayment) {
      return res.status(404).json({ success: false, error: 'Rent payment not found' });
    }

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        id: generateUUID(),
        entityId: vendorId,
        type: 'RENT',
        amount,
        method,
        status: 'PROCESSING',
        reference: transactionReference || `TXN-${Date.now()}`,
      },
    });

    let paymentResult;

    // Route to appropriate gateway
    switch (method) {
      case 'MTN_MOMO':
        paymentResult = await processViaPaymentGateway(
          'MTN',
          amount,
          phoneNumber!,
          transaction.id
        );
        break;

      case 'AIRTEL_MONEY':
        paymentResult = await processViaPaymentGateway(
          'AIRTEL',
          amount,
          phoneNumber!,
          transaction.id
        );
        break;

      case 'BANK':
        paymentResult = {
          success: true,
          txId: transaction.id,
          status: 'PENDING_VERIFICATION', // Manual verification needed
        };
        break;

      case 'CASH':
        // Cash payments require admin verification
        paymentResult = {
          success: true,
          txId: transaction.id,
          status: 'PENDING_VERIFICATION',
        };
        break;

      default:
        throw new Error('Unsupported payment method');
    }

    // Update transaction
    if (paymentResult.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: paymentResult.status === 'PENDING_VERIFICATION' ? 'PENDING' : 'SUCCESS',
          referenceId: paymentResult.txId,
        },
      });

      // If immediate success, update rent payment
      if (paymentResult.status !== 'PENDING_VERIFICATION') {
        await prisma.rentPayment.update({
          where: { id: rentPaymentId },
          data: {
            status: 'PAID',
            paymentDate: new Date(),
            transactionId: transaction.id,
            paymentMethod: method,
          },
        });

        // Submit to EFRIS
        await submitToEFRISAsync({
          type: 'RENT_PAYMENT',
          vendorId,
          amount,
          taxAmount: 0, // Rent usually not taxed
          date: new Date(),
          transactionId: transaction.id,
        });

        // Update vendor wallet
        await updateVendorWallet(vendorId, { rentPaid: amount });
      }

      res.json({
        success: true,
        data: {
          transactionId: transaction.id,
          status: paymentResult.status,
          message: paymentResult.status === 'PENDING_VERIFICATION'
            ? 'Payment submitted. Awaiting verification.'
            : 'Payment successful',
        },
      });
    } else {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });

      res.status(400).json({
        success: false,
        error: paymentResult.error || 'Payment failed',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 3. VENDOR PAYMENT SUMMARY
// ============================================

router.get('/vendors/:vendorId/payments/summary', async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    // Get all payment obligations
    const rentPayments = await prisma.rentPayment.findMany({
      where: { vendorId },
      orderBy: { dueDate: 'asc' },
    });

    const taxPayments = await prisma.taxPayment.findMany({
      where: { vendorId },
      orderBy: { dueDate: 'asc' },
    });

    // Calculate totals
    const totalRentDue = rentPayments
      .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalTaxDue = taxPayments
      .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPaidThisMonth = rentPayments
      .filter(p => p.status === 'PAID' && isCurrentMonth(p.paymentDate))
      .reduce((sum, p) => sum + p.amount, 0);

    // Identify overdue
    const now = new Date();
    const overdue = rentPayments.filter(p => p.dueDate < now && p.status !== 'PAID');
    const totalOverdue = overdue.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        vendor: {
          id: vendorId,
          name: (await prisma.vendor.findUnique({ where: { id: vendorId } }))?.name,
        },
        totalRentDue,
        totalTaxDue,
        totalPaidThisMonth,
        totalOverdue,
        nextPaymentDue: rentPayments.find(p => p.status === 'PENDING')?.dueDate,
        obligations: {
          rent: rentPayments,
          tax: taxPayments,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 4. GATE ENTRY & EXIT FLOW (Multi-Step)
// ============================================

interface GateEntryRequest {
  vehiclePlate: string;
  category: 'TRUCK' | 'VAN' | 'BIKE' | 'CAR';
  driverName: string;
  supplierTIN?: string;
}

router.post('/gate/entry', async (req: Request, res: Response) => {
  try {
    const { vehiclePlate, category, driverName, supplierTIN } = req.body as GateEntryRequest;

    // Calculate gate fees
    const feeStructure = getFeeStructure(category);
    const vat = (feeStructure.base * 0.18);
    const totalFee = feeStructure.base + vat;

    // Create gate entry token
    const gateToken = await prisma.gateToken.create({
      data: {
        id: generateUUID(),
        code: generateQRCode(),
        type: 'ENTRY',
        entityName: vehiclePlate,
        status: 'ACTIVE',
        generatedAt: new Date(),
        generatedBy: req.user.id,
        associatedFee: totalFee,
        taxAmount: vat,
      },
    });

    // Create transaction (fee)
    await prisma.transaction.create({
      data: {
        id: generateUUID(),
        type: 'GATE_FEE',
        amount: feeStructure.base,
        taxAmount: vat,
        status: 'PENDING', // Pending payment
        method: 'PENDING',
        reference: gateToken.code,
      },
    });

    res.json({
      success: true,
      data: {
        token: gateToken,
        feeStructure: {
          base: feeStructure.base,
          vat,
          total: totalFee,
        },
        qrCode: generateQRData(gateToken),
        message: 'Entry token generated. Please proceed to counter for payment.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/gate/exit', async (req: Request, res: Response) => {
  try {
    const { tokenCode } = req.body;

    const gateToken = await prisma.gateToken.findUnique({
      where: { code: tokenCode },
    });

    if (!gateToken) {
      return res.status(404).json({ success: false, error: 'Token not found' });
    }

    // Calculate duration
    const durationMs = new Date().getTime() - gateToken.generatedAt.getTime();
    const durationMinutes = Math.ceil(durationMs / 1000 / 60);

    // Check for overstay (e.g., 2-hour limit)
    const ENTRY_LIMIT_MINUTES = 120;
    let overstayFee = 0;

    if (durationMinutes > ENTRY_LIMIT_MINUTES) {
      const overstayMinutes = durationMinutes - ENTRY_LIMIT_MINUTES;
      overstayFee = Math.ceil(overstayMinutes / 30) * 2000; // UGX 2,000 per 30 mins
    }

    // Update gate token
    await prisma.gateToken.update({
      where: { code: tokenCode },
      data: {
        type: 'EXIT',
        status: 'USED',
        exitAt: new Date(),
        durationMinutes,
        overstayFee,
      },
    });

    // If overstay, create additional fee transaction
    if (overstayFee > 0) {
      await prisma.transaction.create({
        data: {
          id: generateUUID(),
          type: 'GATE_FEE',
          amount: overstayFee,
          taxAmount: overstayFee * 0.18,
          status: 'PENDING',
          reference: `OVERSTAY-${tokenCode}`,
        },
      });
    }

    res.json({
      success: true,
      data: {
        duration: durationMinutes,
        overstayFee,
        exitToken: gateToken,
        message: overstayFee > 0
          ? `Overstay fee: UGX ${overstayFee}. Please pay at counter.`
          : 'Exit recorded successfully.',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 5. ADMIN PAYMENT COLLECTIONS DASHBOARD
// ============================================

router.get('/admin/payments/collections', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Revenue metrics
    const allTransactions = await prisma.transaction.findMany({
      where: { status: 'SUCCESS' },
    });

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        status: 'SUCCESS',
        date: { gte: monthStart, lte: monthEnd },
      },
    });

    const totalRevenue = allTransactions.reduce((sum, t) => sum + t.amount, 0);
    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Outstanding payments
    const overduePayments = await prisma.rentPayment.findMany({
      where: {
        status: 'OVERDUE',
        dueDate: { lt: now },
      },
      include: { vendor: true },
    });

    const pendingPayments = await prisma.rentPayment.findMany({
      where: {
        status: 'PENDING',
      },
    });

    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

    const collectionRate = (totalRevenue / (totalRevenue + totalPending + totalOverdue)) * 100;

    res.json({
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        pendingPayments: totalPending,
        overduePayments: totalOverdue,
        collectionRate,
        topPayingVendors: [], // Query separately if needed
        recentPayments: monthlyTransactions.slice(-10),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 6. EFRIS SUBMISSION (Batch)
// ============================================

async function submitToEFRISAsync(data: any): Promise<void> {
  try {
    // Call URA EFRIS S2S API
    const efrisPayload = formatPayloadForEFRIS(data);
    const encrypted = await uraclient.encryptPayload(efrisPayload);
    const signed = await uraclient.signPayload(encrypted);

    const response = await uraclient.submitInvoice({
      payload: signed,
    });

    if (response.success) {
      console.log('✅ EFRIS submission successful:', response.invoiceNumber);
      
      // Update transaction with EFRIS data
      await prisma.transaction.update({
        where: { id: data.transactionId },
        data: {
          efrisInvoiceNumber: response.invoiceNumber,
          efrisQRCode: response.qrCode,
          efrisTimestamp: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('❌ EFRIS submission failed:', error);
    // Queue for retry
    await queueForEFRISRetry(data);
  }
}

export default router;
```

---

### **B. EFRIS Integration Service**

```typescript
// src/integrations/ura-efris-integration.ts
// Direct integration with ura-efris-js-sdk

import {
  URAEfrisClient,
  EfrisInvoice,
  EfrisPayload,
} from 'ura-efris-sdk';

class MarketMasterEFRISService {
  private client: URAEfrisClient;
  private taxpayerTIN: string;

  constructor() {
    this.client = new URAEfrisClient({
      environment: process.env.EFRIS_ENV || 'sandbox',
      clientId: process.env.URA_CLIENT_ID!,
      clientSecret: process.env.URA_CLIENT_SECRET!,
      certificatePath: process.env.URA_CERT_PATH!,
    });

    this.taxpayerTIN = process.env.MARKET_MASTER_TIN!; // MarketMaster's TIN
  }

  /**
   * Submit a sales transaction to EFRIS
   * Called when:
   * - Vendor makes a sale to customer
   * - PO payment from supplier
   * - Any taxable transaction
   */
  async submitSaleTransaction(data: {
    vendorId: string;
    vendorTIN: string;
    buyerName: string;
    items: Array<{ description: string; quantity: number; unitPrice: number }>;
    totalAmount: number;
    taxAmount: number;
    paymentMethod: string;
    transactionDate: Date;
  }): Promise<{
    success: boolean;
    invoiceNumber: string;
    qrCode: string;
    timestamp: string;
  }> {
    try {
      // Build EFRIS invoice
      const invoice: EfrisInvoice = {
        sellerTIN: data.vendorTIN,
        buyerName: data.buyerName,
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: data.transactionDate,
        items: data.items.map((item, idx) => ({
          itemNumber: idx + 1,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
        totalTaxableAmount: data.totalAmount - data.taxAmount,
        totalTax: data.taxAmount,
        grossAmount: data.totalAmount,
        paymentMode: data.paymentMethod,
      };

      // Encrypt payload
      const encryptedPayload = await this.client.encryptPayload(invoice);

      // Sign payload
      const signedPayload = await this.client.signPayload(encryptedPayload);

      // Submit to EFRIS
      const response = await this.client.submitInvoice({
        payload: signedPayload,
      });

      if (response.responseCode === '00') {
        return {
          success: true,
          invoiceNumber: response.invoiceNumber,
          qrCode: response.qrCode,
          timestamp: response.timestamp,
        };
      } else {
        throw new Error(`EFRIS Error: ${response.responseDescription}`);
      }
    } catch (error) {
      console.error('EFRIS submission failed:', error);
      throw error;
    }
  }

  /**
   * Submit a debit note (reversal/refund) to EFRIS
   */
  async submitDebitNote(data: {
    originalInvoiceNumber: string;
    reason: string;
    refundAmount: number;
    taxAmount: number;
  }): Promise<{ success: boolean; debitNoteNumber: string }> {
    try {
      const debitNote = {
        originalInvoiceNumber: data.originalInvoiceNumber,
        debitNoteNumber: generateDebitNoteNumber(),
        reason: data.reason,
        refundAmount: data.refundAmount,
        taxAmount: data.taxAmount,
      };

      const encryptedPayload = await this.client.encryptPayload(debitNote);
      const signedPayload = await this.client.signPayload(encryptedPayload);

      const response = await this.client.submitDebitNote({
        payload: signedPayload,
      });

      if (response.responseCode === '00') {
        return {
          success: true,
          debitNoteNumber: response.debitNoteNumber,
        };
      } else {
        throw new Error(`EFRIS Debit Note Error: ${response.responseDescription}`);
      }
    } catch (error) {
      console.error('EFRIS debit note submission failed:', error);
      throw error;
    }
  }

  /**
   * Query transaction status from EFRIS
   */
  async queryTransactionStatus(
    invoiceNumber: string
  ): Promise<{ status: string; validated: boolean }> {
    try {
      const response = await this.client.queryInvoice(invoiceNumber);
      return {
        status: response.status,
        validated: response.validated,
      };
    } catch (error) {
      console.error('EFRIS query failed:', error);
      throw error;
    }
  }

  /**
   * Get EFRIS daily summary (for reconciliation)
   */
  async getDailySummary(date: Date): Promise<{
    totalInvoices: number;
    totalAmount: number;
    totalTax: number;
  }> {
    try {
      const response = await this.client.getDailySummary(date);
      return {
        totalInvoices: response.invoiceCount,
        totalAmount: response.totalAmount,
        totalTax: response.totalTax,
      };
    } catch (error) {
      console.error('EFRIS daily summary failed:', error);
      throw error;
    }
  }

  /**
   * Batch submit multiple transactions (for end-of-day sync)
   */
  async batchSubmitTransactions(transactions: any[]): Promise<{
    successful: number;
    failed: number;
    results: Array<{ txId: string; success: boolean; error?: string }>;
  }> {
    const results = [];

    for (const tx of transactions) {
      try {
        const result = await this.submitSaleTransaction(tx);
        results.push({
          txId: tx.transactionId,
          success: true,
          ...result,
        });
      } catch (error: any) {
        results.push({
          txId: tx.transactionId,
          success: false,
          error: error.message,
        });
      }
    }

    return {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
  }
}

export default new MarketMasterEFRISService();
```

---

### **C. Frontend Component (Vendor Payment Portal)**

```typescript
// src/pages/vendor/PaymentSummary.tsx
// React component for vendor payment dashboard

import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { PaymentSummary, RentPayment, TaxPayment } from '../../types';

export function PaymentSummary({ vendorId }: { vendorId: string }) {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK' | 'CASH'>('MTN_MOMO');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load payment summary
  useEffect(() => {
    fetchPaymentSummary();
  }, [vendorId]);

  const fetchPaymentSummary = async () => {
    try {
      const { data } = await ApiService.payments.getVendorSummary(vendorId);
      setSummary(data.data);
    } catch (error) {
      console.error('Failed to load payment summary:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment
  const handlePayment = async (payment: RentPayment) => {
    setProcessing(true);
    try {
      const response = await ApiService.payments.recordRentPayment({
        vendorId,
        rentPaymentId: payment.id,
        amount: payment.amount,
        paymentMethod: paymentMethod,
        paymentDate: new Date().toISOString(),
        phoneNumber: paymentMethod === 'MTN_MOMO' ? phoneNumber : undefined,
        documentId: `DOC-${Date.now()}`,
      });

      // Show success
      alert(`✅ Payment of UGX ${payment.amount} processed successfully!`);
      fetchPaymentSummary();
      setSelectedPayment(null);
    } catch (error: any) {
      alert(`❌ Payment failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!summary) return <div>No data</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-sm font-semibold text-red-700">Rent Due</div>
          <div className="text-2xl font-bold text-red-900">
            UGX {summary.totalRentDue?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="text-sm font-semibold text-orange-700">Overdue</div>
          <div className="text-2xl font-bold text-orange-900">
            UGX {summary.totalOverdue?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-sm font-semibold text-green-700">Paid This Month</div>
          <div className="text-2xl font-bold text-green-900">
            UGX {summary.totalPaidThisMonth?.toLocaleString() || 0}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm font-semibold text-blue-700">Next Due</div>
          <div className="text-lg font-bold text-blue-900">
            {new Date(summary.nextPaymentDue || '').toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Payment Obligations Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Payment Obligations</h2>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Period</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Due Date</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {summary.obligations?.map((obligation) => (
              <tr key={obligation.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">
                  {new Date(obligation.periodStart).toLocaleDateString()} -{' '}
                  {new Date(obligation.periodEnd).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  UGX {obligation.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {new Date(obligation.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      obligation.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : obligation.status === 'OVERDUE'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {obligation.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  {obligation.status !== 'PAID' && (
                    <button
                      onClick={() => setSelectedPayment(obligation)}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onSubmit={handlePayment}
          processing={processing}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          phoneNumber={phoneNumber}
          setPhoneNumber={setPhoneNumber}
        />
      )}
    </div>
  );
}

function PaymentModal({ payment, onClose, onSubmit, ...props }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-xl font-semibold mb-4">Make Payment</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount Due</label>
            <input
              type="text"
              value={`UGX ${payment.amount.toLocaleString()}`}
              disabled
              className="w-full px-4 py-2 bg-gray-100 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Payment Method</label>
            <select
              value={props.paymentMethod}
              onChange={(e) => props.setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border rounded"
            >
              <option value="MTN_MOMO">MTN Mobile Money</option>
              <option value="AIRTEL_MONEY">Airtel Money</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CASH">Cash (At Counter)</option>
            </select>
          </div>

          {props.paymentMethod === 'MTN_MOMO' && (
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number</label>
              <input
                type="tel"
                placeholder="256..."
                value={props.phoneNumber}
                onChange={(e) => props.setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => onSubmit(payment)}
              disabled={props.processing}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {props.processing ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## **8. Implementation Roadmap** {#implementation-roadmap}

### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Set up URA EFRIS S2S integration (sandbox)
- [ ] Implement basic payment flow API
- [ ] Create wallet system (Market, Vendor, Supplier, Tax)
- [ ] Build vendor dashboard UI

### **Phase 2: Payment Gateway Integration (Weeks 5-8)**
- [ ] Integrate MTN Mobile Money API
- [ ] Integrate Airtel Money API
- [ ] Implement payment retry logic & fallback
- [ ] Build payment history frontend

### **Phase 3: Advanced Features (Weeks 9-12)**
- [ ] Implement installment plans
- [ ] Add EFRIS debit notes (refunds)
- [ ] Gate entry/exit automation
- [ ] Offline mode support

### **Phase 4: Admin & Analytics (Weeks 13-16)**
- [ ] Market admin dashboard
- [ ] Payment collections analytics
- [ ] Automated payment reminders
- [ ] EFRIS reconciliation reports

### **Phase 5: URA Compliance & Launch (Weeks 17-20)**
- [ ] Submit to URA for VSDC/SDC approval
- [ ] Obtain EFRIS device & credentials
- [ ] Production EFRIS integration
- [ ] Market-wide pilot launch

---

## **Summary & Key Takeaways**

| Question | Answer |
|----------|--------|
| **How is payment processed?** | Multi-gateway (MTN/Airtel/Bank/Cash) → Transaction recorded → EFRIS submitted → Wallets updated → Settlement scheduled |
| **Where does payment go?** | Rent → Market Admin Wallet / VAT → URA (via EFRIS) / PO Cost → Supplier Wallet / Commission → Platform |
| **Benefits of MMIS?** | Centralized tax compliance, vendor accountability, operational efficiency, nation-wide market formalization |
| **How to be aggregator?** | Register with URA, request VSDC/SDC, integrate EFRIS S2S SDK, pass compliance audit |
| **Aggregator vs. Not?** | Aggregator = Scalable, centralized control. Non-Aggregator = Fragmented, vendor burden. **Choose Aggregator.** |
| **Partial payments?** | Create installment plans, track per installment, remind vendors, charge late fees, sync all to EFRIS |
| **Gateway failure?** | Retry logic (3 attempts) + fallback to alternative gateway + admin alert if all fail |
| **Refunds?** | Generate EFRIS debit note, reverse VAT, process gateway refund, audit trail maintained |
| **Offline cash?** | Record locally, sync when online, reconcile cash drawer, submit batch to EFRIS |

---

**Next Steps for Your Team:**

1. **Immediate:** Review URA EFRIS official documentation from their portal
2. **Week 1:** Schedule meeting with URA for VSDC/SDC application
3. **Week 2:** Integrate `ura-efris-js-sdk` into MarketMasterApi (use code examples above)
4. **Week 3:** Build payment flow backend (use code templates provided)
5. **Week 4:** Create frontend components & test with mock data
6. **Week 5:** Submit to URA for compliance review

Good luck! 🚀

## @FarhanSabit

Which SDK is best suited for our system? (oits-dhaka is us rest repos are the comparable repos).
Give a tabular comparison among the SDKs in terms of technology, features, functionalities, supports, business logic alignment with our system, best practice followed, compatibility etc.

## Copilot


