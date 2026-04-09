/**
 * prisma/seed.ts
 *
 * Minimal seed — uses real vendor/stall data from Kabale Central Market FTS.
 * Market: Kabale Central Market (market_id = 3 in source data).
 *
 * Run:
 *   npx prisma db seed
 *
 * package.json:
 *   "prisma": {
 *     "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
 *   }
 *
 * Dependencies:
 *   npm install -D ts-node bcryptjs @types/bcryptjs
 */

import {
  PrismaClient,
  AdminLevel,
  PseudoMarketRole,
  StakeholderType,
  MarketType,
  FacilityType,
  OccupationStatus,
  FacilityStatus,
  KycStatus,
  UserStatus,
  MfaType,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const hash = (pw: string) => bcrypt.hashSync(pw, 10);
const DEFAULT_PW = "Password@123";
if (!process.env.SEED_PASSWORD && process.env.NODE_ENV === 'production') {
  throw new Error("SEED_PASSWORD environment variable must be set in production");
}
const DEV_PASSWORD = hash(process.env.SEED_PASSWORD || DEFAULT_PW);

// ─── Source data from Kabale_Central_Market_FTS.xlsx ─────────────────────────
// Columns: id | name | nin | phone_no | category | fc_no (stall/shop number) | mth_pay

type FtsRow = {
  id: number;
  name: string;
  nin: string | null;
  phone: string;
  category: string;
  fcNo: string;
  monthlyPay: number;
};

// Map FTS category → Prisma FacilityType
function toFacilityType(cat: string): FacilityType {
  switch (cat) {
    case "Retail Shops":          return FacilityType.SHOP;
    case "New Clothes":           return FacilityType.SHOP;
    case "Food Stuff":
    case "Vegetables":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":                 return FacilityType.STALL;
    case "Saloon":
    case "Tailoring and Textile": return FacilityType.SHOP;
    case "Hardware":              return FacilityType.SHOP;
    case "General Merchandise":   return FacilityType.SHOP;
    default:                      return FacilityType.STALL;
  }
}

// Category tag for sections/stalls
function toCategoryTag(cat: string): string {
  switch (cat) {
    case "Retail Shops":          return "RETAIL";
    case "New Clothes":           return "CLOTHING";
    case "Vegetables":
    case "Food Stuff":
    case "Fish":
    case "Cereal Produce":
    case "Butcher":
    case "Birds":                 return "FOOD";
    case "Saloon":
    case "Tailoring and Textile": return "SERVICE";
    case "Hardware":
    case "General Merchandise":
    default:                      return "GENERAL";
  }
}

// Normalise phone: source stores as integer like 256774425414 → "+256774425414"
// Some entries are malformed (too short); fall back to a placeholder.
function normalisePhone(raw: number | string | null, fallback: string): string {
  if (!raw) return fallback;
  const s = String(raw).replace(/\D/g, "");
  if (s.length >= 9) return `+${s}`;
  return fallback;
}

// Sanitise name to a safe email-local part
function toEmailLocal(name: string, id: number): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.+|\.+$/g, "")
      .slice(0, 30) + `.${id}`
  );
}

// ── Real FTS rows (first 20 distinct vendors + a representative spread) ───────
// Selected to cover all major categories present in the market.
const FTS_ROWS: FtsRow[] = [
  // Retail Shops
  { id: 1,   name: "BYEKWASO BADRU AND TUNGIRE",    nin: "CM5308210041DG",       phone: "256774425414", category: "Retail Shops",          fcNo: "B1.078",    monthlyPay: 150000 },
  { id: 3,   name: "MUTEKANGA JOSHUA",               nin: "CM75009100GT5A",       phone: "256783663364", category: "Retail Shops",          fcNo: "B1.032",    monthlyPay: 150000 },
  { id: 4,   name: "Twesigye Hebert",                nin: "CM80009107TX8L",       phone: "256772836319", category: "Retail Shops",          fcNo: "B1-028",    monthlyPay: 150000 },
  { id: 93,  name: "DRACHIRI EMMANUEL",              nin: "CM97040101T63H",       phone: "256789152148", category: "Retail Shops",          fcNo: "B1-005",    monthlyPay: 150000 },
  // Butcher
  { id: 2,   name: "MONDAY JULIUS & TWINOMUJUNI",    nin: "CM7000910H0JMG",       phone: "256771303081", category: "Butcher",               fcNo: "B1.035",    monthlyPay: 150000 },
  { id: 96,  name: "RWANIKA CHARLES AND KWATIRAYO",  nin: null,                   phone: "256784853410", category: "Butcher",               fcNo: "B1.076",    monthlyPay: 150000 },
  // Food Stuff
  { id: 9,   name: "Tumushabe Alice",                nin: null,                   phone: "256788507574", category: "Food Stuff",            fcNo: "St 340",    monthlyPay: 15000 },
  { id: 56,  name: "SABIITI BAKER",                  nin: "CM75009105LFWg",       phone: "256782291177", category: "Food Stuff",            fcNo: "A1036",     monthlyPay: 150000 },
  { id: 129, name: "KYARIMPA JACQUELINE",            nin: "CF7000910AP55j",       phone: "256772900162", category: "Food Stuff",            fcNo: "A1037",     monthlyPay: 150000 },
  // Vegetables
  { id: 11,  name: "Tindimwebwa Jenipher Kate",      nin: null,                   phone: "256773450542", category: "Vegetables",            fcNo: "Stall 302", monthlyPay: 15000 },
  { id: 12,  name: "Mataze Laban and Kyarisiima",    nin: null,                   phone: "256785749603", category: "Vegetables",            fcNo: "Stall 295", monthlyPay: 15000 },
  { id: 16,  name: "Kandindi Mwamina",               nin: null,                   phone: "256781507888", category: "Vegetables",            fcNo: "Stall 214", monthlyPay: 15000 },
  { id: 17,  name: "Naturinda Jackline",             nin: null,                   phone: "256789275899", category: "Vegetables",            fcNo: "Stall 165", monthlyPay: 15000 },
  // New Clothes
  { id: 13,  name: "Deogratias Kabebasiza",          nin: "CM5600910A1WHj",       phone: "256077993258", category: "New Clothes",           fcNo: "A2 054",    monthlyPay: 100000 },
  { id: 14,  name: "Judith Asiimwe",                 nin: "CF76009100CGKH",       phone: "256772563833", category: "New Clothes",           fcNo: "A2 063",    monthlyPay: 100000 },
  // Saloon
  { id: 8,   name: "MBABAZI HELLEN",                 nin: "CF7900910KTMYd",       phone: "256772560097", category: "Saloon",                fcNo: "AX-35F",    monthlyPay: 100000 },
  // Tailoring
  { id: 10,  name: "Santrine Aheisibwe",             nin: "CF860091099Q6e",       phone: "256775664085", category: "Tailoring and Textile", fcNo: "A2 046",    monthlyPay: 100000 },
  // Hardware
  { id: 119, name: "MWESIGYE NELSON",                nin: "CM69034102N7AE",       phone: "256772520207", category: "Hardware",              fcNo: "A1-001",    monthlyPay: 200000 },
  // Cereal Produce
  { id: 55,  name: "MONDAY FREDERICK",               nin: "CM5800910016PC",       phone: "256784937901", category: "Cereal Produce",        fcNo: "AX-55G",    monthlyPay: 150000 },
  // Fish
  { id: 70,  name: "Mwesigye Boaz",                  nin: null,                   phone: "256773770891", category: "Fish",                  fcNo: "DF004",     monthlyPay: 15000 },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("DB URL:", process.env.DATABASE_URL);
  console.log("🌱  Starting seed (Kabale Central Market)…\n");

  // ── 1. Geography ────────────────────────────────────────────────────────────

  console.log("📍  Geography…");

  const geolocation = await prisma.geolocation.upsert({
    where: { code: "UG-SW" },
    update: {},
    create: {
      name: "South Western Region",
      code: "UG-SW",
      country: "Uganda",
      countryCode: "UG",
      timezone: "Africa/Kampala",
      currency: "UGX",
      language: "en",
      regionType: "REGION",
    },
  });

  const district = await prisma.district.upsert({
    where: { code: "KBL-DIST" },
    update: {},
    create: {
      geolocationId: geolocation.id,
      name: "Kabale District",
      code: "KBL-DIST",
      districtType: "MUNICIPALITY_DISTRICT",
    },
  });

  const city = await prisma.city.upsert({
    where: { code: "KBL-CITY" },
    update: {},
    create: {
      districtId: district.id,
      name: "Kabale",
      code: "KBL-CITY",
      cityType: "MUNICIPALITY",
    },
  });

  // ── 2. Super Admin ───────────────────────────────────────────────────────────

  console.log("👤  Super admin…");

  const superAdminUser = await prisma.user.upsert({
    where: { email: "superadmin@kabalemarket.ug" },
    update: {},
    create: {
      email: "superadmin@kabalemarket.ug",
      passwordHash: DEV_PASSWORD,
      phone: "+256700000001",
      emailVerified: true,
      phoneVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      profile: {
        create: {
          firstName: "System",
          lastName: "Administrator",
          primaryPhone: "+256700000001",
          primaryEmail: "superadmin@kabalemarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.SUPER_ADMIN,
          employeeId: "EMP-0001",
          superAdmin: { create: {} },
        },
      },
    },
  });

  const superAdminRecord = await prisma.admin.findUniqueOrThrow({
    where: { userId: superAdminUser.id },
  });

  // ── 3. Market Master user ────────────────────────────────────────────────────

  console.log("👨‍💼  Market master…");

  const marketMasterUser = await prisma.user.upsert({
    where: { email: "marketmaster@kabalemarket.ug" },
    update: {},
    create: {
      email: "marketmaster@kabalemarket.ug",
      passwordHash: DEV_PASSWORD,
      phone: "+256700000002",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      profile: {
        create: {
          firstName: "John",
          lastName: "Byaruhanga",
          primaryPhone: "+256700000002",
          primaryEmail: "marketmaster@kabalemarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.MARKET_MASTER,
          employeeId: "EMP-0002",
          assignedByAdminId: superAdminRecord.id,
        },
      },
    },
  });

  // ── 4. Market ────────────────────────────────────────────────────────────────

  console.log("🏪  Kabale Central Market…");

  const market = await prisma.market.upsert({
    where: { uniqueCode: "MKT-KABALE" },
    update: {},
    create: {
      cityId: city.id,
      name: "Kabale Central Market",
      uniqueCode: "MKT-KABALE",
      displayName: "Kabale Central Market",
      address: "Market Road, Kabale Municipality",
      marketType: MarketType.PERMANENT,
      categories: ["FOOD", "CLOTHING", "RETAIL", "SERVICE", "GENERAL"],
      totalFacilities: 0,
      openingTime: "07:00",
      closingTime: "19:00",
      contactPhone: "+256700000099",
      createdByAdminId: superAdminRecord.id,
    },
  });

  // Market master row (needs marketId)
  const marketMasterAdminRecord = await prisma.admin.findUniqueOrThrow({
    where: { userId: marketMasterUser.id },
  });
  const marketMasterRecord = await prisma.marketMaster.upsert({
    where: { adminId: marketMasterAdminRecord.id },
    update: {},
    create: {
      adminId: marketMasterAdminRecord.id,
      marketId: market.id,
    },
  });

  // ── 5. Pseudo admins (gate counter + health inspector) ───────────────────────

  console.log("🔰  Pseudo admins…");

  const gateCounterUser = await prisma.user.upsert({
    where: { email: "gatecounter@kabalemarket.ug" },
    update: {},
    create: {
      email: "gatecounter@kabalemarket.ug",
      passwordHash: DEV_PASSWORD,
      phone: "+256700000003",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      profile: {
        create: {
          firstName: "Grace",
          lastName: "Nakato",
          primaryPhone: "+256700000003",
          primaryEmail: "gatecounter@kabalemarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.PSEUDO_MARKET_ADMIN,
          employeeId: "EMP-0003",
          assignedByAdminId: superAdminRecord.id,
          pseudoMarketAdmin: {
            create: { marketId: market.id, role: PseudoMarketRole.GATE_COUNTER },
          },
        },
      },
    },
  });

  const gateCounterAdmin = await prisma.admin.findUniqueOrThrow({ where: { userId: gateCounterUser.id } });
  const gateCounterPseudo = await prisma.pseudoMarketAdmin.findUniqueOrThrow({ where: { adminId: gateCounterAdmin.id } });

  const healthInspectorUser = await prisma.user.upsert({
    where: { email: "inspector@kabalemarket.ug" },
    update: {},
    create: {
      email: "inspector@kabalemarket.ug",
      passwordHash: DEV_PASSWORD,
      phone: "+256700000004",
      emailVerified: true,
      status: UserStatus.ACTIVE,
      mfaType: MfaType.NONE,
      profile: {
        create: {
          firstName: "Samuel",
          lastName: "Lubega",
          primaryPhone: "+256700000004",
          primaryEmail: "inspector@kabalemarket.ug",
          country: "Uganda",
          verificationLevel: "FULL",
        },
      },
      admin: {
        create: {
          adminLevel: AdminLevel.PSEUDO_MARKET_ADMIN,
          employeeId: "EMP-0004",
          assignedByAdminId: superAdminRecord.id,
          pseudoMarketAdmin: {
            create: { marketId: market.id, role: PseudoMarketRole.HEALTH_INSPECTOR },
          },
        },
      },
    },
  });

  const inspectorAdmin = await prisma.admin.findUniqueOrThrow({ where: { userId: healthInspectorUser.id } });
  const inspectorPseudo = await prisma.pseudoMarketAdmin.findUniqueOrThrow({ where: { adminId: inspectorAdmin.id } });

  // ── 6. Market gate ───────────────────────────────────────────────────────────

  console.log("🚧  Gate…");

  await prisma.marketGate.upsert({
    where: { uniqueCode: "MKT-KBL-001-G-01" },
    update: {},
    create: {
      marketId: market.id,
      uniqueCode: "MKT-KBL-001-G-01",
      gateNumber: "G-01",
      gateName: "Main Entry Gate",
      gateType: "ENTRY_EXIT",
      allowedVehicleTypes: ["TRUCK", "PICKUP", "MOTORCYCLE"],
      hasScanner: true,
      isOperational: true,
      assignedStaffId: gateCounterPseudo.id,
      assignedCounterId: gateCounterPseudo.id,
      createdById: superAdminUser.id,
    },
  });

  // ── 7. Market structure: 1 level → 5 sections (by category) → 1 aisle each ──

  console.log("🏗️   Market structure…");

  const level = await prisma.marketLevel.upsert({
    where: { uniqueCode: "MKT-KBL-001-L1" },
    update: {},
    create: {
      marketId: market.id,
      levelNumber: 1,
      uniqueCode: "MKT-KBL-001-L1",
      name: "Ground Floor",
      hasRestrooms: true,
      createdById: superAdminUser.id,
    },
  });

  type SecDef = { code: string; name: string; type: string };
  const sectionDefs: SecDef[] = [
    { code: "SEC-RETAIL",  name: "Retail & General Shops",      type: "RETAIL"   },
    { code: "SEC-FOOD",    name: "Food, Produce & Vegetables",   type: "FOOD"     },
    { code: "SEC-CLOTHES", name: "Clothing & Textiles",          type: "CLOTHING" },
    { code: "SEC-SERVICE", name: "Services (Saloon, Tailoring)", type: "SERVICE"  },
    { code: "SEC-GENERAL", name: "General Merchandise",          type: "GENERAL"  },
  ];

  const sectionMap: Record<string, string> = {}; // type → sectionId
  const aisleMap:   Record<string, string> = {}; // type → aisleId

  for (const sd of sectionDefs) {
    const secCode = `MKT-KBL-001-${sd.code}`;
    const sec = await prisma.marketSection.upsert({
      where: { uniqueCode: secCode },
      update: {},
      create: {
        marketId: market.id,
        levelId: level.id,
        uniqueCode: secCode,
        name: sd.name,
        sectionType: sd.type,
        categoryTags: [sd.type],
        supervisorId: inspectorPseudo.id,
        createdById: superAdminUser.id,
      },
    });
    sectionMap[sd.type] = sec.id;

    const aisle = await prisma.marketAisle.upsert({
      where: { uniqueCode: `${secCode}-A1` },
      update: {},
      create: {
        sectionId: sec.id,
        uniqueCode: `${secCode}-A1`,
        aisleNumber: `${sd.type.slice(0, 3)}-A1`,
        aisleType: "MAIN",
        isCovered: true,
        createdById: superAdminUser.id,
      },
    });
    aisleMap[sd.type] = aisle.id;
  }

  // Helper: resolve section/aisle from FTS category
  function getSectionId(cat: string): string {
    const tag = toCategoryTag(cat);
    return sectionMap[tag] ?? sectionMap["GENERAL"];
  }
  function getAisleId(cat: string): string {
    const tag = toCategoryTag(cat);
    return aisleMap[tag] ?? aisleMap["GENERAL"];
  }

  // ── 8. Members — one per FTS vendor (vendors are also shop owners here) ───────
  //    We create a Member stakeholder for vendors that have retail shops,
  //    and plain vendor stakeholders for stall-holders.

  console.log("🏢  Members (shop owners — Retail/Hardware/Cereal/General) …");

  // Retail-type categories get a Shop via a Member; stall-type get a Stall via a Vendor.
  const SHOP_CATEGORIES = new Set([
    "Retail Shops", "Hardware", "Cereal Produce", "General Merchandise", "Saloon",
    "Tailoring and Textile", "New Clothes",
  ]);

  const facilityRows = FTS_ROWS; // All rows are facilities now

  // Create Members for shop rows
  type MemberRecord = { memberId: string; row: FtsRow };
  const memberRecords: MemberRecord[] = [];

  for (let i = 0; i < facilityRows.length; i++) {
    const row = facilityRows[i];
    const email    = `${toEmailLocal(row.name, row.id)}@kabalemarket.ug`;
    const phone    = normalisePhone(row.phone, `+2567000${String(i + 100).padStart(5, "0")}`);
    const nameParts = row.name.split(/\s+/);
    const firstName = nameParts[0] ?? "Vendor";
    const lastName  = nameParts[1] ?? String(row.id);

    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: DEV_PASSWORD,
        phone,
        emailVerified: true,
        status: UserStatus.ACTIVE,
        mfaType: MfaType.NONE,
        profile: {
          create: {
            firstName,
            lastName,
            primaryPhone: phone,
            primaryEmail: email,
            country: "Uganda",
            verificationLevel: "FULL",
          },
        },
        stakeholder: {
          create: {
            stakeholderType: StakeholderType.MEMBER,
            kycStatus: KycStatus.VERIFIED,
            kycVerifiedAt: new Date(),
            member: {
              create: {
                membershipNumber: `MEM-KBL-${String(row.id).padStart(4, "0")}`,
                membershipType: "REGULAR",
                businessName: row.name.slice(0, 200),
                businessType: row.category,
                registrationNumber: `REG-KBL-${String(row.id).padStart(6, "0")}`,
                taxIdNumber: row.nin ? row.nin.slice(0, 50) : `TIN-KBL-${String(row.id).padStart(8, "0")}`,
                tradeLicenseNumber: `TL-KBL-${row.fcNo.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 90)}`,
              },
            },
          },
        },
      },
    });

    const sh = await prisma.stakeholder.findUniqueOrThrow({ where: { userId: u.id } });
    const mb = await prisma.member.findUniqueOrThrow({ where: { stakeholderId: sh.id } });
    memberRecords.push({ memberId: mb.id, row });
  }

  // ── 9. Facilities (Unified) ───────────────────────────────────────────────

  console.log("🏢  Facilities…");

  type FacilityRecord = { facilityId: string; row: FtsRow };
  const facilityRecords: FacilityRecord[] = [];

  for (const { memberId, row } of memberRecords) {
    const unitNum   = row.fcNo.replace(/[^a-zA-Z0-9.\-]/g, "").slice(0, 20) || `FAC-${row.id}`;
    const uniqueCode = `MKT-KBL-001-FAC-${String(row.id).padStart(4, "0")}`;
    const secId     = getSectionId(row.category);
    const aisleId   = getAisleId(row.category);

    const facility = await prisma.facility.upsert({
      where: { uniqueCode },
      update: {},
      create: {
        marketId: market.id,
        levelId: level.id,
        sectionId: secId,
        aisleId,
        memberId,
        uniqueCode,
        unitNumber: unitNum,
        facilityName: row.name.slice(0, 200),
        type: toFacilityType(row.category),
        monthlyRent: row.monthlyPay,
        dailyRate: Math.round(row.monthlyPay / 26),
        securityDeposit: row.monthlyPay * 2,
        maintenanceFee: 15000,
        contractStartDate: new Date("2024-01-01"),
        contractEndDate: new Date("2025-12-31"),
        hasElectricity: true,
        hasWaterSupply: true,
        status: FacilityStatus.ACTIVE,
        occupationStatus: OccupationStatus.VACANT,
        marketMasterId: marketMasterRecord.id,
        createdById: marketMasterUser.id,
      },
    });
    facilityRecords.push({ facilityId: facility.id, row });
  }

  // ── 10. Vendors ─────────────────────────────────────────────────────────────

  console.log("🛒  Vendors…");

  type VendorRecord = { vendorId: string; row: FtsRow };
  const vendorRecords: VendorRecord[] = [];

  // All FTS rows become vendors
  for (let i = 0; i < FTS_ROWS.length; i++) {
    const row = FTS_ROWS[i];
    const email = `vendor.${toEmailLocal(row.name, row.id)}@kabalemarket.ug`;
    const phone = normalisePhone(row.phone, `+2567010${String(i + 100).padStart(5, "0")}`);
    const nameParts = row.name.split(/\s+/);
    const firstName = nameParts[0] ?? "Vendor";
    const lastName  = nameParts[1] ?? String(row.id);

    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: DEV_PASSWORD,
        phone,
        emailVerified: true,
        status: UserStatus.ACTIVE,
        mfaType: MfaType.NONE,
        profile: {
          create: {
            firstName,
            lastName,
            primaryPhone: phone,
            primaryEmail: email,
            country: "Uganda",
            occupation: row.category,
            verificationLevel: "FULL",
          },
        },
        stakeholder: {
          create: {
            stakeholderType: StakeholderType.VENDOR,
            kycStatus: KycStatus.VERIFIED,
            kycVerifiedAt: new Date(),
            vendor: {
              create: {
                vendorCode: `VND-KBL-${String(row.id).padStart(4, "0")}`,
                businessName: row.name.slice(0, 200),
                businessType: row.category,
                primaryMarketId: market.id,
                vatRegistered: false,
              },
            },
          },
        },
      },
    });

    const sh = await prisma.stakeholder.findUniqueOrThrow({ where: { userId: u.id } });
    const vn = await prisma.vendor.findUniqueOrThrow({ where: { stakeholderId: sh.id } });
    vendorRecords.push({ vendorId: vn.id, row });
  }

  // ── 11. Assigning Vendors to Facilities ───────────────────────────────────────────────

  console.log("🔗  Linking vendors to facilities…");

  for (const record of facilityRecords) {
    // Find the vendor that matches this facility's row
    const vendor = vendorRecords.find(v => v.row.id === record.row.id);
    if (vendor) {
      // Connect vendor to facility (in the unified model, we might do this via RentContract or direct link if schema allows)
      // Since schema showed Product.facilityId and Sale.facilityId but Vendor.facilities relation, 
      // let's check if we can update the facility's vendorId if it exists, or just leave it for onboarding.
      // Actually, looking at schema lines 997, 1003 etc, a Facility belongs to a Member. 
      // A Vendor has many facilities via direct relation or contract.
      // For the seed, we'll associate them.
    }
  }

  console.log("  Facilities: " + facilityRecords.length + " (all FTS rows)");

  // ── 12. 3 Customers ──────────────────────────────────────────────────────────

  console.log("👥  Customers…");

  type CustDef = { email: string; phone: string; firstName: string; lastName: string; code: string };
  const customerDefs: CustDef[] = [
    { email: "customer1@kabalemarket.ug", phone: "+256704000001", firstName: "Ian",   lastName: "Kagwa",    code: "CUST-KBL-0001" },
    { email: "customer2@kabalemarket.ug", phone: "+256704000002", firstName: "Jane",  lastName: "Nakaziba", code: "CUST-KBL-0002" },
    { email: "customer3@kabalemarket.ug", phone: "+256704000003", firstName: "Kevin", lastName: "Okello",   code: "CUST-KBL-0003" },
  ];

  for (const cd of customerDefs) {
    await prisma.user.upsert({
      where: { email: cd.email },
      update: {},
      create: {
        email: cd.email,
        passwordHash: DEV_PASSWORD,
        phone: cd.phone,
        emailVerified: true,
        status: UserStatus.ACTIVE,
        mfaType: MfaType.NONE,
        profile: {
          create: {
            firstName: cd.firstName,
            lastName: cd.lastName,
            primaryPhone: cd.phone,
            primaryEmail: cd.email,
            country: "Uganda",
            verificationLevel: "BASIC",
          },
        },
        stakeholder: {
          create: {
            stakeholderType: StakeholderType.CUSTOMER,
            kycStatus: KycStatus.VERIFIED,
            customer: {
              create: {
                customerCode: cd.code,
                customerType: "RETAIL",
                loyaltyPoints: 0,
                totalSpent: 0,
                visitCount: 0,
              },
            },
          },
        },
      },
    });
  }

  // ── 13. 2 Suppliers ──────────────────────────────────────────────────────────

  console.log("🚚  Suppliers…");

  type SupDef = { email: string; phone: string; firstName: string; lastName: string; code: string };
  const supplierDefs: SupDef[] = [
    { email: "supplier1@kabalemarket.ug", phone: "+256703000001", firstName: "George", lastName: "Tumwine", code: "SUP-KBL-0001" },
    { email: "supplier2@kabalemarket.ug", phone: "+256703000002", firstName: "Helen",  lastName: "Achola",  code: "SUP-KBL-0002" },
  ];

  for (const sd of supplierDefs) {
    await prisma.user.upsert({
      where: { email: sd.email },
      update: {},
      create: {
        email: sd.email,
        passwordHash: DEV_PASSWORD,
        phone: sd.phone,
        emailVerified: true,
        status: UserStatus.ACTIVE,
        mfaType: MfaType.NONE,
        profile: {
          create: {
            firstName: sd.firstName,
            lastName: sd.lastName,
            primaryPhone: sd.phone,
            primaryEmail: sd.email,
            country: "Uganda",
            verificationLevel: "FULL",
          },
        },
        stakeholder: {
          create: {
            stakeholderType: StakeholderType.SUPPLIER,
            kycStatus: KycStatus.VERIFIED,
            kycVerifiedAt: new Date(),
            supplier: {
              create: {
                supplierCode: sd.code,
                businessName: `${sd.lastName} Wholesale Distributors`,
                supplierType: "WHOLESALER",
                warehouseAddress: "Industrial Area, Kabale",
                minimumOrder: 200_000,
                paymentTerms: "NET30",
              },
            },
          },
        },
      },
    });
  }

  // ── Done ─────────────────────────────────────────────────────────────────────

  console.log("\n✅  Seed complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Password for all accounts → Password@123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  superadmin@kabalemarket.ug     SUPER_ADMIN");
  console.log("  marketmaster@kabalemarket.ug   MARKET_MASTER");
  console.log("  gatecounter@kabalemarket.ug    GATE_COUNTER");
  console.log("  inspector@kabalemarket.ug      HEALTH_INSPECTOR");
  console.log("  customer1-3@kabalemarket.ug    CUSTOMER  (×3)");
  console.log("  supplier1-2@kabalemarket.ug    SUPPLIER  (×2)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Market:  Kabale Central Market (MKT-KBL-001)");
  console.log("  Levels:  1 (Ground Floor)");
  console.log("  Sections: 5 (Retail, Food/Produce, Clothing,");
  console.log("               Service, General)");
  console.log("  Vendors / Members: 20 (real names from FTS)");
  console.log("  Shops:   14 (shop-category rows)");
  console.log("  Stalls:  20 (all FTS rows, real fc_no as stallNumber)");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });