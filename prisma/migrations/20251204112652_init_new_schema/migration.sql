-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING', 'DELETED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('SUPER_ADMIN', 'NATIONAL_ADMIN', 'DISTRICT_ADMIN', 'CITY_ADMIN', 'MARKET_MASTER', 'PSEUDO_MARKET_ADMIN');

-- CreateEnum
CREATE TYPE "PseudoMarketRole" AS ENUM ('REVENUE_COLLECTOR', 'HEALTH_INSPECTOR', 'SECURITY_ADMIN', 'GATE_COUNTER', 'STOCK_COUNTER', 'VAT_PAYMENT_COUNTER', 'WAREHOUSE_MANAGER', 'QUALITY_CONTROLLER');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('MARKET_AUTHORITY', 'MEMBER', 'VENDOR', 'SUPPLIER', 'CUSTOMER', 'GUEST');

-- CreateEnum
CREATE TYPE "MfaType" AS ENUM ('EMAIL', 'SMS', 'TOTP', 'NONE');

-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'ACCOUNT_RECOVERY', 'ADMIN_INVITATION', 'KYC_VERIFICATION');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED', 'USED');

-- CreateEnum
CREATE TYPE "InvitationType" AS ENUM ('ADMIN_ONBOARDING', 'VENDOR_REGISTRATION', 'SUPPLIER_REGISTRATION', 'KYC_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "PermissionResource" AS ENUM ('SYSTEM', 'USER', 'MARKET', 'CITY', 'DISTRICT', 'SHOP', 'STALL', 'PRODUCT', 'INVENTORY', 'GATE', 'PAYMENT', 'TAX', 'REPORT', 'SETTINGS', 'KYC', 'INVITATION', 'ROLE', 'PERMISSION', 'DOCUMENT', 'AUDIT', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "PermissionAction" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE', 'MANAGE', 'APPROVE', 'VERIFY', 'EXPORT', 'IMPORT', 'ASSIGN', 'REVOKE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ID_PROOF', 'ADDRESS_PROOF', 'BUSINESS_LICENSE', 'TAX_REGISTRATION', 'BANK_STATEMENT', 'UTILITY_BILL', 'PASSPORT', 'DRIVING_LICENSE', 'VENDOR_CERTIFICATE', 'SUPPLIER_CERTIFICATE', 'QUALITY_CERTIFICATE', 'INSURANCE_POLICY', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketType" AS ENUM ('PERMANENT', 'TEMPORARY', 'POP_UP', 'WEEKLY_BAZAAR', 'SEASONAL');

-- CreateEnum
CREATE TYPE "ShopType" AS ENUM ('RETAIL', 'WHOLESALE', 'SERVICE', 'FOOD', 'ELECTRONICS', 'CLOTHING', 'FURNITURE', 'JEWELRY', 'PHARMACY', 'STATIONERY', 'OTHER');

-- CreateEnum
CREATE TYPE "StallType" AS ENUM ('PERMANENT', 'TEMPORARY', 'SEASONAL', 'POP_UP', 'KIOSK');

-- CreateEnum
CREATE TYPE "MarketTokenType" AS ENUM ('GATE_ENTRY', 'GATE_EXIT', 'STOCK_RECEIPT', 'STOCK_DISPATCH', 'PAYMENT_CONFIRMATION', 'TAX_PAYMENT', 'RENT_PAYMENT', 'INSPECTION_APPROVAL', 'DELIVERY_CONFIRMATION', 'VEHICLE_PASS', 'VISITOR_PASS', 'TEMPORARY_ACCESS');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('PENDING', 'ACTIVE', 'USED', 'EXPIRED', 'REVOKED', 'INVALIDATED');

-- CreateEnum
CREATE TYPE "QrCodeType" AS ENUM ('USER_IDENTIFICATION', 'STAFF_IDENTIFICATION', 'VEHICLE_PASS', 'PRODUCT_TRACKING', 'PAYMENT_RECEIPT', 'GATE_PASS', 'DELIVERY_CONFIRMATION', 'INSPECTION_TAG');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaType" "MfaType" NOT NULL DEFAULT 'NONE',
    "totpSecret" VARCHAR(255),
    "totpBackupCodes" TEXT[],
    "lastTotpUsed" TIMESTAMP(3),
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastEmailVerificationSent" TIMESTAMP(3),
    "lastPhoneVerificationSent" TIMESTAMP(3),
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockUntil" TIMESTAMP(3),
    "lastLogin" TIMESTAMP(3),
    "lastPasswordChange" TIMESTAMP(3),
    "passwordHistory" TEXT[],
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "deactivationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(10),
    "firstName" VARCHAR(100) NOT NULL,
    "middleName" VARCHAR(100),
    "lastName" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(150),
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER,
    "nationalId" VARCHAR(50),
    "nationalIdType" VARCHAR(20) DEFAULT 'NIN',
    "passportNumber" VARCHAR(50),
    "passportCountry" VARCHAR(100),
    "taxIdNumber" VARCHAR(50),
    "primaryPhone" VARCHAR(20) NOT NULL,
    "secondaryPhone" VARCHAR(20),
    "emergencyPhone" VARCHAR(20),
    "emergencyContact" VARCHAR(100),
    "primaryEmail" VARCHAR(255) NOT NULL,
    "secondaryEmail" VARCHAR(255),
    "residentialAddress" VARCHAR(500),
    "permanentAddress" VARCHAR(500),
    "city" VARCHAR(100),
    "district" VARCHAR(100),
    "country" VARCHAR(100) NOT NULL DEFAULT 'Uganda',
    "postalCode" VARCHAR(20),
    "occupation" VARCHAR(100),
    "companyName" VARCHAR(200),
    "designation" VARCHAR(100),
    "yearsOfExperience" INTEGER,
    "maritalStatus" "MaritalStatus",
    "spouseName" VARCHAR(100),
    "religion" VARCHAR(50),
    "language" TEXT[] DEFAULT ARRAY['en', 'sw']::TEXT[],
    "profilePictureUrl" VARCHAR(500),
    "signatureUrl" VARCHAR(500),
    "preferredLanguage" VARCHAR(10) NOT NULL DEFAULT 'en',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Africa/Kampala',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "notificationPreferences" JSONB,
    "verificationLevel" VARCHAR(20) NOT NULL DEFAULT 'BASIC',
    "verifiedByAdminId" TEXT,
    "verificationDate" TIMESTAMP(3),
    "personalQRCode" VARCHAR(100),
    "qrCodeExpiry" TIMESTAMP(3),
    "bankName" VARCHAR(100),
    "bankAccountNumber" VARCHAR(50),
    "bankAccountName" VARCHAR(150),
    "metadata" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastProfileUpdate" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "tokenType" "VerificationTokenType" NOT NULL,
    "userId" TEXT,
    "email" VARCHAR(255),
    "phone" VARCHAR(20),
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "location" JSONB,
    "purposeData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionToken" VARCHAR(255) NOT NULL,
    "refreshToken" VARCHAR(255),
    "deviceId" VARCHAR(100),
    "deviceName" VARCHAR(100),
    "deviceType" VARCHAR(50),
    "os" VARCHAR(50),
    "browser" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "coordinates" JSONB,
    "mfaVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastActivity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoutReason" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedOutAt" TIMESTAMP(3),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geolocations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL DEFAULT 'Uganda',
    "countryCode" VARCHAR(10) NOT NULL DEFAULT 'UG',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Africa/Kampala',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "regionType" VARCHAR(50) NOT NULL DEFAULT 'REGION',
    "population" INTEGER,
    "areaSqKm" DOUBLE PRECISION,
    "coordinates" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geolocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "geolocationId" TEXT NOT NULL DEFAULT '',
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "districtType" VARCHAR(50),
    "population" INTEGER,
    "areaSqKm" DOUBLE PRECISION,
    "headquarters" VARCHAR(200),
    "coordinates" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "cityType" VARCHAR(50),
    "population" INTEGER,
    "areaSqKm" DOUBLE PRECISION,
    "mayor" VARCHAR(150),
    "coordinates" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "markets" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "displayName" VARCHAR(200),
    "description" TEXT,
    "address" VARCHAR(500) NOT NULL,
    "marketType" "MarketType" NOT NULL DEFAULT 'PERMANENT',
    "categories" TEXT[],
    "totalLevels" INTEGER NOT NULL DEFAULT 1,
    "totalSections" INTEGER NOT NULL DEFAULT 0,
    "totalShops" INTEGER NOT NULL DEFAULT 0,
    "totalStalls" INTEGER NOT NULL DEFAULT 0,
    "occupiedShops" INTEGER NOT NULL DEFAULT 0,
    "occupiedStalls" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER,
    "openingTime" VARCHAR(10) NOT NULL DEFAULT '06:00',
    "closingTime" VARCHAR(10) NOT NULL DEFAULT '20:00',
    "operatingDays" TEXT[] DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']::TEXT[],
    "is24Hours" BOOLEAN NOT NULL DEFAULT false,
    "holidaySchedule" JSONB,
    "contactPhone" VARCHAR(20),
    "contactEmail" VARCHAR(255),
    "website" VARCHAR(200),
    "managerName" VARCHAR(150),
    "averageRent" DECIMAL(12,2),
    "securityDeposit" DECIMAL(12,2),
    "monthlyMaintenanceFee" DECIMAL(10,2),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "establishmentDate" TIMESTAMP(3),
    "lastRenovation" TIMESTAMP(3),
    "notes" TEXT,
    "createdByAdminId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "markets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_levels" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "levelNumber" INTEGER NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "accessType" VARCHAR(50),
    "hasElevator" BOOLEAN NOT NULL DEFAULT false,
    "hasEscalator" BOOLEAN NOT NULL DEFAULT false,
    "hasRestrooms" BOOLEAN NOT NULL DEFAULT true,
    "hasParking" BOOLEAN NOT NULL DEFAULT false,
    "totalSections" INTEGER NOT NULL DEFAULT 0,
    "totalShops" INTEGER NOT NULL DEFAULT 0,
    "totalStalls" INTEGER NOT NULL DEFAULT 0,
    "wheelchairAccess" BOOLEAN NOT NULL DEFAULT false,
    "emergencyExits" INTEGER NOT NULL DEFAULT 2,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "lastInspection" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_sections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "levelId" TEXT,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "displayName" VARCHAR(150),
    "description" TEXT,
    "sectionType" VARCHAR(100) NOT NULL,
    "subType" VARCHAR(100),
    "categoryTags" TEXT[],
    "locationCode" VARCHAR(10),
    "entranceGate" VARCHAR(50),
    "totalShops" INTEGER NOT NULL DEFAULT 0,
    "totalStalls" INTEGER NOT NULL DEFAULT 0,
    "occupiedShops" INTEGER NOT NULL DEFAULT 0,
    "occupiedStalls" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "hasCommonLighting" BOOLEAN NOT NULL DEFAULT true,
    "hasWaterSupply" BOOLEAN NOT NULL DEFAULT true,
    "hasSecurityCamera" BOOLEAN NOT NULL DEFAULT false,
    "supervisorId" TEXT,
    "assistantIds" TEXT[],
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "openingTime" VARCHAR(10),
    "closingTime" VARCHAR(10),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sectionRules" JSONB,
    "specialRequirements" VARCHAR(500),

    CONSTRAINT "market_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_aisles" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "aisleNumber" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100),
    "aisleType" VARCHAR(20) NOT NULL DEFAULT 'MAIN',
    "isCovered" BOOLEAN NOT NULL DEFAULT true,
    "maxStallsPerSide" INTEGER,
    "fireExitAccess" BOOLEAN NOT NULL DEFAULT true,
    "emergencyLighting" BOOLEAN NOT NULL DEFAULT true,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "lastCleaning" TIMESTAMP(3),
    "lastMaintenance" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_aisles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stakeholders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stakeholderType" "StakeholderType" NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "kycSubmittedAt" TIMESTAMP(3),
    "kycVerifiedAt" TIMESTAMP(3),
    "kycVerifiedByAdminId" TEXT,
    "kycDocuments" JSONB,
    "bankAccountDetails" JSONB,
    "taxComplianceStatus" VARCHAR(50) DEFAULT 'COMPLIANT',
    "businessRating" DOUBLE PRECISION DEFAULT 5.0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_authorities" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "authorityName" VARCHAR(200) NOT NULL,
    "registrationNumber" VARCHAR(100) NOT NULL,
    "jurisdiction" TEXT[],
    "contactPerson" VARCHAR(150),
    "officeAddress" VARCHAR(500),
    "website" VARCHAR(200),

    CONSTRAINT "market_authorities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "membershipNumber" VARCHAR(50) NOT NULL,
    "membershipType" VARCHAR(50) NOT NULL DEFAULT 'REGULAR',
    "membershipSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "membershipExpiry" TIMESTAMP(3),
    "businessName" VARCHAR(200) NOT NULL,
    "businessType" VARCHAR(100),
    "registrationNumber" VARCHAR(100) NOT NULL,
    "taxIdNumber" VARCHAR(50),
    "tradeLicenseNumber" VARCHAR(100),
    "yearsInBusiness" INTEGER,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "vendorCode" VARCHAR(50) NOT NULL,
    "businessName" VARCHAR(200) NOT NULL,
    "businessType" VARCHAR(100),
    "businessLicenseNumber" VARCHAR(100),
    "taxIdNumber" VARCHAR(50),
    "vatRegistered" BOOLEAN NOT NULL DEFAULT false,
    "vatNumber" VARCHAR(50),
    "yearsInBusiness" INTEGER,
    "preferredMarkets" TEXT[],
    "primaryMarketId" TEXT,
    "marketMasterApprovalId" TEXT,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "supplierCode" VARCHAR(50) NOT NULL,
    "businessName" VARCHAR(200) NOT NULL,
    "supplierType" VARCHAR(50) NOT NULL DEFAULT 'WHOLESALER',
    "licenseNumber" VARCHAR(100),
    "taxId" VARCHAR(50),
    "warehouseAddress" VARCHAR(500),
    "deliveryRadius" INTEGER,
    "minimumOrder" DECIMAL(10,2),
    "paymentTerms" VARCHAR(50) DEFAULT 'NET30',

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "customerCode" VARCHAR(50) NOT NULL,
    "customerType" VARCHAR(50) NOT NULL DEFAULT 'RETAIL',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3),
    "preferredPaymentMethod" VARCHAR(50) DEFAULT 'CASH',
    "discountEligible" BOOLEAN NOT NULL DEFAULT false,
    "discountRate" DOUBLE PRECISION DEFAULT 0.0,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "guestCode" VARCHAR(50) NOT NULL,
    "temporaryId" VARCHAR(100) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "purpose" VARCHAR(100),
    "sponsorId" TEXT,
    "accessAreas" TEXT[],

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shops" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "levelId" TEXT,
    "sectionId" TEXT,
    "memberId" TEXT NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "shopNumber" VARCHAR(20) NOT NULL,
    "displayName" VARCHAR(150),
    "shopName" VARCHAR(200) NOT NULL,
    "shopType" "ShopType" NOT NULL DEFAULT 'RETAIL',
    "subType" VARCHAR(100),
    "categoryTags" TEXT[],
    "locationDescription" VARCHAR(500),
    "accessPoints" TEXT[],
    "hasElectricity" BOOLEAN NOT NULL DEFAULT true,
    "hasWaterSupply" BOOLEAN NOT NULL DEFAULT true,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasAirConditioning" BOOLEAN NOT NULL DEFAULT false,
    "hasDisplayWindow" BOOLEAN NOT NULL DEFAULT true,
    "hasSecurityShutter" BOOLEAN NOT NULL DEFAULT true,
    "electricityMeterNumber" VARCHAR(50),
    "waterMeterNumber" VARCHAR(50),
    "internetConnection" BOOLEAN NOT NULL DEFAULT false,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "securityDeposit" DECIMAL(12,2),
    "maintenanceFee" DECIMAL(10,2),
    "electricityRate" DECIMAL(8,2),
    "waterRate" DECIMAL(8,2),
    "contractStartDate" TIMESTAMP(3) NOT NULL,
    "contractEndDate" TIMESTAMP(3) NOT NULL,
    "paymentDay" INTEGER NOT NULL DEFAULT 1,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 5,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "occupationStatus" VARCHAR(50) NOT NULL DEFAULT 'OCCUPIED',
    "lastRenovation" TIMESTAMP(3),
    "inspectionDueDate" TIMESTAMP(3),
    "inventoryValue" DECIMAL(15,2),
    "createdById" TEXT NOT NULL,
    "marketMasterId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stalls" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "sectionId" TEXT,
    "aisleId" TEXT,
    "levelId" TEXT,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "stallNumber" VARCHAR(20) NOT NULL,
    "displayName" VARCHAR(150),
    "stallType" "StallType" NOT NULL DEFAULT 'PERMANENT',
    "category" VARCHAR(100) NOT NULL,
    "subCategories" TEXT[],
    "specialization" VARCHAR(100),
    "hasDisplayCounter" BOOLEAN NOT NULL DEFAULT true,
    "hasStorage" BOOLEAN NOT NULL DEFAULT false,
    "hasLighting" BOOLEAN NOT NULL DEFAULT true,
    "hasPowerOutlet" BOOLEAN NOT NULL DEFAULT true,
    "hasCashRegister" BOOLEAN NOT NULL DEFAULT false,
    "dailyRate" DECIMAL(10,2) NOT NULL,
    "monthlyRate" DECIMAL(12,2),
    "securityDeposit" DECIMAL(12,2),
    "billingCycle" VARCHAR(20) NOT NULL DEFAULT 'DAILY',
    "contractStartDate" TIMESTAMP(3) NOT NULL,
    "contractEndDate" TIMESTAMP(3),
    "agreementTerms" JSONB,
    "openingTime" VARCHAR(10),
    "closingTime" VARCHAR(10),
    "operatingDays" TEXT[] DEFAULT ARRAY['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']::TEXT[],
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "operationalStatus" VARCHAR(50) NOT NULL DEFAULT 'OPERATIONAL',
    "lastStockCheck" TIMESTAMP(3),
    "lastCleaning" TIMESTAMP(3),
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "qrCode" VARCHAR(100),
    "createdById" TEXT NOT NULL,
    "marketMasterId" TEXT,
    "marketId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stalls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" VARCHAR(50),
    "adminLevel" "AdminLevel" NOT NULL,
    "assignedByAdminId" TEXT,
    "adminSettings" JSONB,
    "canAssignRoles" JSONB,
    "assignedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "super_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "globalSettings" JSONB,
    "systemAccessLogs" JSONB,
    "apiKeys" JSONB,
    "backupSettings" JSONB,

    CONSTRAINT "super_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "national_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "ministry" VARCHAR(200) NOT NULL,
    "department" VARCHAR(200),
    "officeLocation" VARCHAR(500),
    "jurisdiction" TEXT[],
    "taxAuthorityId" VARCHAR(50),

    CONSTRAINT "national_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "districtId" TEXT NOT NULL,

    CONSTRAINT "district_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "city_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_masters" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,

    CONSTRAINT "market_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pseudo_market_admins" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "role" "PseudoMarketRole" NOT NULL,
    "assignedSection" VARCHAR(100),
    "specialization" VARCHAR(100),
    "workingHours" JSONB,
    "permissions" JSONB,

    CONSTRAINT "pseudo_market_admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_gates" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "uniqueCode" VARCHAR(50) NOT NULL,
    "gateNumber" VARCHAR(20) NOT NULL,
    "gateName" VARCHAR(100),
    "gateType" VARCHAR(20) NOT NULL DEFAULT 'ENTRY',
    "location" VARCHAR(200),
    "accessType" VARCHAR(20) NOT NULL DEFAULT 'ALL',
    "allowedVehicleTypes" JSONB NOT NULL,
    "hasScanner" BOOLEAN NOT NULL DEFAULT false,
    "hasCamera" BOOLEAN NOT NULL DEFAULT false,
    "hasSecurityCheck" BOOLEAN NOT NULL DEFAULT false,
    "isOperational" BOOLEAN NOT NULL DEFAULT true,
    "operatingHours" JSONB,
    "assignedStaffId" TEXT,
    "assignedCounterId" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "lastMaintenance" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_gates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_tokens" (
    "id" TEXT NOT NULL,
    "tokenCode" VARCHAR(100) NOT NULL,
    "tokenType" "MarketTokenType" NOT NULL,
    "shortCode" VARCHAR(50),
    "tokenValue" VARCHAR(255),
    "displayValue" VARCHAR(100),
    "marketId" TEXT NOT NULL,
    "gateId" TEXT,
    "stallId" TEXT,
    "vendorId" TEXT,
    "customerId" TEXT,
    "adminId" TEXT,
    "userId" TEXT,
    "guestId" TEXT,
    "vehicleNumber" VARCHAR(50),
    "vehicleType" VARCHAR(50),
    "driverName" VARCHAR(100),
    "visitorName" VARCHAR(100),
    "visitorType" VARCHAR(50),
    "transactionId" TEXT,
    "amount" DECIMAL(12,2),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "purpose" VARCHAR(200),
    "description" VARCHAR(500),
    "metadata" JSONB,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isSingleUse" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "status" "TokenStatus" NOT NULL DEFAULT 'PENDING',
    "usedAt" TIMESTAMP(3),
    "invalidatedAt" TIMESTAMP(3),
    "invalidationReason" VARCHAR(500),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_usage_logs" (
    "id" TEXT NOT NULL,
    "tokenId" TEXT NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "usedByUserId" TEXT,
    "usedByAdminId" TEXT,
    "usedAtGateId" TEXT,
    "usedAtCounterId" VARCHAR(100),
    "deviceId" VARCHAR(100),
    "deviceType" VARCHAR(50),
    "scannerId" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "gpsCoordinates" JSONB,
    "isValid" BOOLEAN NOT NULL,
    "validationMessage" VARCHAR(500),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_codes" (
    "id" TEXT NOT NULL,
    "qrCode" VARCHAR(255) NOT NULL,
    "qrType" "QrCodeType" NOT NULL,
    "shortCode" VARCHAR(50),
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT NOT NULL,
    "encodedData" JSONB NOT NULL,
    "publicData" JSONB,
    "encryptionKey" VARCHAR(255),
    "size" INTEGER NOT NULL DEFAULT 256,
    "errorCorrection" VARCHAR(5) NOT NULL DEFAULT 'M',
    "foregroundColor" VARCHAR(10) NOT NULL DEFAULT '#000000',
    "backgroundColor" VARCHAR(10) NOT NULL DEFAULT '#FFFFFF',
    "logoUrl" VARCHAR(500),
    "scanCount" INTEGER NOT NULL DEFAULT 0,
    "lastScanned" TIMESTAMP(3),
    "firstScanned" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxScans" INTEGER,
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "allowedScanners" TEXT[],
    "createdById" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_scan_logs" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannerId" VARCHAR(100),
    "scannedByUserId" TEXT,
    "scannedByAdminId" TEXT,
    "scannedAtGateId" TEXT,
    "scannedAtCounterId" VARCHAR(100),
    "deviceId" VARCHAR(100),
    "deviceType" VARCHAR(50),
    "os" VARCHAR(50),
    "browser" VARCHAR(100),
    "ipAddress" VARCHAR(45),
    "gpsCoordinates" JSONB,
    "isValid" BOOLEAN NOT NULL,
    "validationResult" JSONB,
    "errorMessage" VARCHAR(500),
    "responseData" JSONB,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qr_scan_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_operations" (
    "id" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "operationType" VARCHAR(50) NOT NULL,
    "tokenId" TEXT,
    "qrCodeId" TEXT,
    "entityType" VARCHAR(50),
    "entityId" TEXT,
    "entityName" VARCHAR(150),
    "vehicleNumber" VARCHAR(50),
    "vehicleType" VARCHAR(50),
    "driverName" VARCHAR(100),
    "goodsDescription" VARCHAR(500),
    "quantity" DECIMAL(12,2),
    "weight" DECIMAL(10,2),
    "inspectionNotes" TEXT,
    "inspectionResult" VARCHAR(50),
    "inspectorId" TEXT,
    "entryTime" TIMESTAMP(3),
    "exitTime" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "isApproved" BOOLEAN NOT NULL DEFAULT true,
    "approvalNotes" VARCHAR(500),
    "recordedById" TEXT,
    "validatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "level" "AdminLevel",
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "permissions" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedById" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" "PermissionResource" NOT NULL DEFAULT 'SYSTEM',
    "action" "PermissionAction" NOT NULL DEFAULT 'CREATE',
    "conditions" JSONB,
    "grantedById" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "invitationType" "InvitationType" NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "scopeType" VARCHAR(50),
    "scopeId" TEXT,
    "recipientName" VARCHAR(150),
    "roleId" TEXT,
    "sentByAdminId" TEXT,
    "sentByUserId" TEXT,
    "acceptedByUserId" TEXT,
    "vendorId" TEXT,
    "supplierId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "districtScopeId" TEXT,
    "cityScopeId" TEXT,
    "marketScopeId" TEXT,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(50) NOT NULL,
    "entityId" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "userId" TEXT,
    "adminId" TEXT,
    "stakeholderId" TEXT,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "endpoint" VARCHAR(500),
    "httpMethod" VARCHAR(10),
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "actionUrl" VARCHAR(500),
    "actionLabel" VARCHAR(100),
    "data" JSONB,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_submissions" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "submissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "level" VARCHAR(20) NOT NULL DEFAULT 'BASIC',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "submittedDocs" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileName" VARCHAR(200) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "verifiedById" TEXT,
    "verificationDate" TIMESTAMP(3),
    "verificationStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "verificationNotes" TEXT,
    "metadata" JSONB,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_assets" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT,
    "assetType" VARCHAR(50) NOT NULL,
    "fileName" VARCHAR(200) NOT NULL,
    "fileUrl" VARCHAR(500) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "metadata" JSONB,
    "uploadedById" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digital_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'UGX',
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "referenceId" VARCHAR(100),
    "externalReference" VARCHAR(100),
    "paymentMethod" VARCHAR(50),
    "paymentGateway" VARCHAR(100),
    "gatewayResponse" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "customerId" TEXT,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "taxAmount" DECIMAL(12,2) NOT NULL,
    "discountAmount" DECIMAL(12,2) NOT NULL,
    "netAmount" DECIMAL(12,2) NOT NULL,
    "paymentMethod" VARCHAR(50) NOT NULL,
    "paymentStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "transactionId" VARCHAR(100),
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(5,2),

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "category" VARCHAR(100) NOT NULL,
    "subCategory" VARCHAR(100),
    "unit" VARCHAR(20) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "costPrice" DECIMAL(12,2),
    "wholesalePrice" DECIMAL(12,2),
    "sku" VARCHAR(100),
    "barcode" VARCHAR(100),
    "currentStock" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "minStockLevel" DECIMAL(10,2),
    "maxStockLevel" DECIMAL(10,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "supplierId" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_records" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "recordType" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "previousQuantity" DECIMAL(10,2),
    "newQuantity" DECIMAL(10,2) NOT NULL,
    "referenceId" VARCHAR(100),
    "referenceType" VARCHAR(50),
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "stallId" TEXT,
    "movementType" VARCHAR(50) NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "productName" VARCHAR(200) NOT NULL,
    "productCategory" VARCHAR(100),
    "vehicleNumber" VARCHAR(50),
    "vehicleType" VARCHAR(50),
    "driverName" VARCHAR(100),
    "inspectedById" TEXT,
    "inspectionNotes" TEXT,
    "inspectionStatus" VARCHAR(50),
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_payments" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "taxType" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" VARCHAR(50),
    "transactionId" VARCHAR(100),
    "receiptNumber" VARCHAR(100),
    "collectedById" TEXT,
    "collectionNotes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_taxes" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "taxType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "rate" DECIMAL(5,2) NOT NULL,
    "calculationType" VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE',
    "appliesTo" TEXT[],
    "minAmount" DECIMAL(12,2),
    "maxAmount" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveUntil" TIMESTAMP(3),
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_generation_configs" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "tokenType" "MarketTokenType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "prefix" VARCHAR(10),
    "suffix" VARCHAR(10),
    "length" INTEGER NOT NULL DEFAULT 10,
    "charset" VARCHAR(50) NOT NULL DEFAULT 'alphanumeric',
    "expirationHours" INTEGER,
    "isSingleUse" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER DEFAULT 1,
    "requireValidation" BOOLEAN NOT NULL DEFAULT false,
    "validationRules" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_generation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "qr_generation_configs" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "qrType" "QrCodeType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "size" INTEGER NOT NULL DEFAULT 256,
    "errorCorrection" VARCHAR(5) NOT NULL DEFAULT 'M',
    "foregroundColor" VARCHAR(10) NOT NULL DEFAULT '#000000',
    "backgroundColor" VARCHAR(10) NOT NULL DEFAULT '#FFFFFF',
    "includeLogo" BOOLEAN NOT NULL DEFAULT false,
    "logoUrl" VARCHAR(500),
    "logoSize" INTEGER DEFAULT 50,
    "dataTemplate" JSONB,
    "encryptionMethod" VARCHAR(50),
    "expirationDays" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_generation_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scanner_devices" (
    "id" TEXT NOT NULL,
    "deviceId" VARCHAR(100) NOT NULL,
    "marketId" TEXT NOT NULL,
    "gateId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "deviceType" VARCHAR(50) NOT NULL,
    "manufacturer" VARCHAR(100),
    "model" VARCHAR(100),
    "serialNumber" VARCHAR(100),
    "firmwareVersion" VARCHAR(50),
    "ipAddress" VARCHAR(45),
    "macAddress" VARCHAR(20),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMP(3),
    "batteryLevel" INTEGER,
    "metadata" JSONB,
    "registeredById" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scanner_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_collections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "collectedAmount" DECIMAL(15,2) NOT NULL,
    "expectedAmount" DECIMAL(15,2),
    "collectionMethod" VARCHAR(50) NOT NULL,
    "bankDepositSlip" VARCHAR(100),
    "collectorId" TEXT NOT NULL,
    "verifiedById" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COLLECTED',
    "notes" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_payments" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" VARCHAR(50) NOT NULL,
    "transactionId" VARCHAR(100),
    "receiptNumber" VARCHAR(100),
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "lateFee" DECIMAL(10,2),
    "gracePeriodDays" INTEGER DEFAULT 5,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "receivedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rent_contracts" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "landlordId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "monthlyRent" DECIMAL(12,2) NOT NULL,
    "securityDeposit" DECIMAL(12,2),
    "maintenanceFee" DECIMAL(10,2),
    "paymentDay" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "terminationDate" TIMESTAMP(3),
    "terminationReason" VARCHAR(500),
    "contractNumber" VARCHAR(100) NOT NULL,
    "termsAndConditions" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_inspections" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "inspectionDate" TIMESTAMP(3) NOT NULL,
    "inspectorId" TEXT NOT NULL,
    "hygieneScore" INTEGER NOT NULL,
    "safetyScore" INTEGER NOT NULL,
    "complianceScore" INTEGER NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "violations" TEXT[],
    "correctiveActions" TEXT[],
    "remarks" TEXT,
    "followUpDate" TIMESTAMP(3),
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_regulations" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "regulationNumber" VARCHAR(100),
    "appliesTo" TEXT[],
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "enforcementDate" TIMESTAMP(3),
    "complianceLevel" VARCHAR(50),
    "penalties" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "market_regulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_licenses" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "authorityId" TEXT NOT NULL,
    "licenseeId" TEXT NOT NULL,
    "licenseNumber" VARCHAR(100) NOT NULL,
    "licenseType" VARCHAR(100) NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "renewalDate" TIMESTAMP(3),
    "businessName" VARCHAR(200) NOT NULL,
    "businessType" VARCHAR(100),
    "businessAddress" VARCHAR(500),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "licenseFee" DECIMAL(12,2),
    "renewalFee" DECIMAL(12,2),
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_items" (
    "id" TEXT NOT NULL,
    "deliveryId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "receivedQuantity" DECIMAL(10,2),
    "qualityStatus" VARCHAR(50),
    "qualityNotes" TEXT,

    CONSTRAINT "delivery_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_invoices" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "invoiceNumber" VARCHAR(100) NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(15,2) NOT NULL,
    "taxAmount" DECIMAL(12,2),
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "amountPaid" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "amountDue" DECIMAL(15,2) NOT NULL,
    "paymentStatus" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" VARCHAR(50),
    "status" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(12,2) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(500),

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_reviews" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR(200),
    "comment" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "stallId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(100),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "priority" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    "assignedToId" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNotes" TEXT,
    "customerSatisfaction" INTEGER,
    "feedback" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "referenceId" VARCHAR(100),
    "referenceType" VARCHAR(50),
    "expiresAt" TIMESTAMP(3),
    "status" VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    "description" VARCHAR(500),
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guest_entries" (
    "id" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "purpose" VARCHAR(100),
    "visitedStalls" TEXT[],
    "verifiedById" TEXT,
    "verificationNotes" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guest_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gate_entries" (
    "id" TEXT NOT NULL,
    "marketId" TEXT NOT NULL,
    "gateId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "entryTime" TIMESTAMP(3) NOT NULL,
    "exitTime" TIMESTAMP(3),
    "vehicleNumber" VARCHAR(50),
    "vehicleType" VARCHAR(50),
    "driverName" VARCHAR(100),
    "goodsDescription" VARCHAR(500),
    "quantity" DECIMAL(12,2),
    "weight" DECIMAL(10,2),
    "purpose" VARCHAR(100),
    "counterId" TEXT,
    "verificationNotes" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'ENTERED',
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gate_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_assets" (
    "id" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "assetType" VARCHAR(50) NOT NULL,
    "assetUrl" VARCHAR(500) NOT NULL,
    "fileName" VARCHAR(200) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stall_assets" (
    "id" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "assetType" VARCHAR(50) NOT NULL,
    "assetUrl" VARCHAR(500) NOT NULL,
    "fileName" VARCHAR(200) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "tags" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stall_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "stallId" TEXT NOT NULL,
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "expectedDate" TIMESTAMP(3),
    "receivedDate" TIMESTAMP(3),
    "vehicleNumber" VARCHAR(50),
    "driverName" VARCHAR(100),
    "driverPhone" VARCHAR(20),
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "deliveryStatus" VARCHAR(50),
    "verifiedById" TEXT,
    "verificationNotes" TEXT,
    "metadata" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_emailVerified_idx" ON "users"("emailVerified");

-- CreateIndex
CREATE INDEX "users_phoneVerified_idx" ON "users"("phoneVerified");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_lastLogin_idx" ON "users"("lastLogin");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_nationalId_key" ON "user_profiles"("nationalId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_passportNumber_key" ON "user_profiles"("passportNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_taxIdNumber_key" ON "user_profiles"("taxIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_personalQRCode_key" ON "user_profiles"("personalQRCode");

-- CreateIndex
CREATE INDEX "user_profiles_nationalId_idx" ON "user_profiles"("nationalId");

-- CreateIndex
CREATE INDEX "user_profiles_passportNumber_idx" ON "user_profiles"("passportNumber");

-- CreateIndex
CREATE INDEX "user_profiles_taxIdNumber_idx" ON "user_profiles"("taxIdNumber");

-- CreateIndex
CREATE INDEX "user_profiles_gender_idx" ON "user_profiles"("gender");

-- CreateIndex
CREATE INDEX "user_profiles_dateOfBirth_idx" ON "user_profiles"("dateOfBirth");

-- CreateIndex
CREATE INDEX "user_profiles_verificationLevel_idx" ON "user_profiles"("verificationLevel");

-- CreateIndex
CREATE INDEX "user_profiles_personalQRCode_idx" ON "user_profiles"("personalQRCode");

-- CreateIndex
CREATE INDEX "user_profiles_country_idx" ON "user_profiles"("country");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_token_idx" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "verification_tokens_tokenType_idx" ON "verification_tokens"("tokenType");

-- CreateIndex
CREATE INDEX "verification_tokens_userId_idx" ON "verification_tokens"("userId");

-- CreateIndex
CREATE INDEX "verification_tokens_email_idx" ON "verification_tokens"("email");

-- CreateIndex
CREATE INDEX "verification_tokens_phone_idx" ON "verification_tokens"("phone");

-- CreateIndex
CREATE INDEX "verification_tokens_expiresAt_idx" ON "verification_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "verification_tokens_isUsed_idx" ON "verification_tokens"("isUsed");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_userId_idx" ON "user_sessions"("userId");

-- CreateIndex
CREATE INDEX "user_sessions_sessionToken_idx" ON "user_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "user_sessions_refreshToken_idx" ON "user_sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "user_sessions_deviceId_idx" ON "user_sessions"("deviceId");

-- CreateIndex
CREATE INDEX "user_sessions_isActive_idx" ON "user_sessions"("isActive");

-- CreateIndex
CREATE INDEX "user_sessions_expiresAt_idx" ON "user_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "geolocations_code_key" ON "geolocations"("code");

-- CreateIndex
CREATE INDEX "geolocations_code_idx" ON "geolocations"("code");

-- CreateIndex
CREATE INDEX "geolocations_country_idx" ON "geolocations"("country");

-- CreateIndex
CREATE INDEX "geolocations_regionType_idx" ON "geolocations"("regionType");

-- CreateIndex
CREATE UNIQUE INDEX "districts_code_key" ON "districts"("code");

-- CreateIndex
CREATE INDEX "districts_code_idx" ON "districts"("code");

-- CreateIndex
CREATE INDEX "districts_geolocationId_idx" ON "districts"("geolocationId");

-- CreateIndex
CREATE INDEX "districts_districtType_idx" ON "districts"("districtType");

-- CreateIndex
CREATE UNIQUE INDEX "cities_code_key" ON "cities"("code");

-- CreateIndex
CREATE INDEX "cities_code_idx" ON "cities"("code");

-- CreateIndex
CREATE INDEX "cities_districtId_idx" ON "cities"("districtId");

-- CreateIndex
CREATE INDEX "cities_cityType_idx" ON "cities"("cityType");

-- CreateIndex
CREATE UNIQUE INDEX "markets_uniqueCode_key" ON "markets"("uniqueCode");

-- CreateIndex
CREATE INDEX "markets_uniqueCode_idx" ON "markets"("uniqueCode");

-- CreateIndex
CREATE INDEX "markets_cityId_idx" ON "markets"("cityId");

-- CreateIndex
CREATE INDEX "markets_marketType_idx" ON "markets"("marketType");

-- CreateIndex
CREATE INDEX "markets_status_idx" ON "markets"("status");

-- CreateIndex
CREATE INDEX "markets_createdAt_idx" ON "markets"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "markets_cityId_name_key" ON "markets"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "market_levels_uniqueCode_key" ON "market_levels"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_levels_uniqueCode_idx" ON "market_levels"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_levels_marketId_idx" ON "market_levels"("marketId");

-- CreateIndex
CREATE INDEX "market_levels_levelNumber_idx" ON "market_levels"("levelNumber");

-- CreateIndex
CREATE INDEX "market_levels_status_idx" ON "market_levels"("status");

-- CreateIndex
CREATE UNIQUE INDEX "market_levels_marketId_levelNumber_key" ON "market_levels"("marketId", "levelNumber");

-- CreateIndex
CREATE UNIQUE INDEX "market_sections_uniqueCode_key" ON "market_sections"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_sections_uniqueCode_idx" ON "market_sections"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_sections_marketId_idx" ON "market_sections"("marketId");

-- CreateIndex
CREATE INDEX "market_sections_levelId_idx" ON "market_sections"("levelId");

-- CreateIndex
CREATE INDEX "market_sections_sectionType_idx" ON "market_sections"("sectionType");

-- CreateIndex
CREATE INDEX "market_sections_supervisorId_idx" ON "market_sections"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "market_sections_marketId_levelId_name_key" ON "market_sections"("marketId", "levelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "market_aisles_uniqueCode_key" ON "market_aisles"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_aisles_uniqueCode_idx" ON "market_aisles"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_aisles_sectionId_idx" ON "market_aisles"("sectionId");

-- CreateIndex
CREATE INDEX "market_aisles_aisleNumber_idx" ON "market_aisles"("aisleNumber");

-- CreateIndex
CREATE INDEX "market_aisles_aisleType_idx" ON "market_aisles"("aisleType");

-- CreateIndex
CREATE UNIQUE INDEX "market_aisles_sectionId_aisleNumber_key" ON "market_aisles"("sectionId", "aisleNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stakeholders_userId_key" ON "stakeholders"("userId");

-- CreateIndex
CREATE INDEX "stakeholders_stakeholderType_idx" ON "stakeholders"("stakeholderType");

-- CreateIndex
CREATE INDEX "stakeholders_kycStatus_idx" ON "stakeholders"("kycStatus");

-- CreateIndex
CREATE INDEX "stakeholders_createdAt_idx" ON "stakeholders"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "market_authorities_stakeholderId_key" ON "market_authorities"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "market_authorities_registrationNumber_key" ON "market_authorities"("registrationNumber");

-- CreateIndex
CREATE INDEX "market_authorities_authorityName_idx" ON "market_authorities"("authorityName");

-- CreateIndex
CREATE INDEX "market_authorities_registrationNumber_idx" ON "market_authorities"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_stakeholderId_key" ON "members"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "members_membershipNumber_key" ON "members"("membershipNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_registrationNumber_key" ON "members"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_taxIdNumber_key" ON "members"("taxIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "members_tradeLicenseNumber_key" ON "members"("tradeLicenseNumber");

-- CreateIndex
CREATE INDEX "members_membershipNumber_idx" ON "members"("membershipNumber");

-- CreateIndex
CREATE INDEX "members_businessName_idx" ON "members"("businessName");

-- CreateIndex
CREATE INDEX "members_registrationNumber_idx" ON "members"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_stakeholderId_key" ON "vendors"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_vendorCode_key" ON "vendors"("vendorCode");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_businessLicenseNumber_key" ON "vendors"("businessLicenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_taxIdNumber_key" ON "vendors"("taxIdNumber");

-- CreateIndex
CREATE UNIQUE INDEX "vendors_vatNumber_key" ON "vendors"("vatNumber");

-- CreateIndex
CREATE INDEX "vendors_vendorCode_idx" ON "vendors"("vendorCode");

-- CreateIndex
CREATE INDEX "vendors_businessName_idx" ON "vendors"("businessName");

-- CreateIndex
CREATE INDEX "vendors_businessLicenseNumber_idx" ON "vendors"("businessLicenseNumber");

-- CreateIndex
CREATE INDEX "vendors_primaryMarketId_idx" ON "vendors"("primaryMarketId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_stakeholderId_key" ON "suppliers"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_licenseNumber_key" ON "suppliers"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_taxId_key" ON "suppliers"("taxId");

-- CreateIndex
CREATE INDEX "suppliers_supplierCode_idx" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE INDEX "suppliers_businessName_idx" ON "suppliers"("businessName");

-- CreateIndex
CREATE INDEX "suppliers_supplierType_idx" ON "suppliers"("supplierType");

-- CreateIndex
CREATE UNIQUE INDEX "customers_stakeholderId_key" ON "customers"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerCode_key" ON "customers"("customerCode");

-- CreateIndex
CREATE INDEX "customers_customerCode_idx" ON "customers"("customerCode");

-- CreateIndex
CREATE INDEX "customers_customerType_idx" ON "customers"("customerType");

-- CreateIndex
CREATE INDEX "customers_loyaltyPoints_idx" ON "customers"("loyaltyPoints");

-- CreateIndex
CREATE UNIQUE INDEX "guests_stakeholderId_key" ON "guests"("stakeholderId");

-- CreateIndex
CREATE UNIQUE INDEX "guests_guestCode_key" ON "guests"("guestCode");

-- CreateIndex
CREATE UNIQUE INDEX "guests_temporaryId_key" ON "guests"("temporaryId");

-- CreateIndex
CREATE INDEX "guests_guestCode_idx" ON "guests"("guestCode");

-- CreateIndex
CREATE INDEX "guests_expiryDate_idx" ON "guests"("expiryDate");

-- CreateIndex
CREATE INDEX "guests_sponsorId_idx" ON "guests"("sponsorId");

-- CreateIndex
CREATE UNIQUE INDEX "shops_uniqueCode_key" ON "shops"("uniqueCode");

-- CreateIndex
CREATE INDEX "shops_uniqueCode_idx" ON "shops"("uniqueCode");

-- CreateIndex
CREATE INDEX "shops_marketId_idx" ON "shops"("marketId");

-- CreateIndex
CREATE INDEX "shops_memberId_idx" ON "shops"("memberId");

-- CreateIndex
CREATE INDEX "shops_shopType_idx" ON "shops"("shopType");

-- CreateIndex
CREATE INDEX "shops_status_idx" ON "shops"("status");

-- CreateIndex
CREATE INDEX "shops_occupationStatus_idx" ON "shops"("occupationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "shops_marketId_shopNumber_key" ON "shops"("marketId", "shopNumber");

-- CreateIndex
CREATE UNIQUE INDEX "stalls_uniqueCode_key" ON "stalls"("uniqueCode");

-- CreateIndex
CREATE UNIQUE INDEX "stalls_qrCode_key" ON "stalls"("qrCode");

-- CreateIndex
CREATE INDEX "stalls_uniqueCode_idx" ON "stalls"("uniqueCode");

-- CreateIndex
CREATE INDEX "stalls_shopId_idx" ON "stalls"("shopId");

-- CreateIndex
CREATE INDEX "stalls_vendorId_idx" ON "stalls"("vendorId");

-- CreateIndex
CREATE INDEX "stalls_category_idx" ON "stalls"("category");

-- CreateIndex
CREATE INDEX "stalls_stallType_idx" ON "stalls"("stallType");

-- CreateIndex
CREATE INDEX "stalls_status_idx" ON "stalls"("status");

-- CreateIndex
CREATE UNIQUE INDEX "stalls_shopId_stallNumber_key" ON "stalls"("shopId", "stallNumber");

-- CreateIndex
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "admins_employeeId_key" ON "admins"("employeeId");

-- CreateIndex
CREATE INDEX "admins_adminLevel_idx" ON "admins"("adminLevel");

-- CreateIndex
CREATE INDEX "admins_employeeId_idx" ON "admins"("employeeId");

-- CreateIndex
CREATE INDEX "admins_assignedAt_idx" ON "admins"("assignedAt");

-- CreateIndex
CREATE UNIQUE INDEX "super_admins_adminId_key" ON "super_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "national_admins_adminId_key" ON "national_admins"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "national_admins_taxAuthorityId_key" ON "national_admins"("taxAuthorityId");

-- CreateIndex
CREATE INDEX "national_admins_ministry_idx" ON "national_admins"("ministry");

-- CreateIndex
CREATE INDEX "national_admins_taxAuthorityId_idx" ON "national_admins"("taxAuthorityId");

-- CreateIndex
CREATE UNIQUE INDEX "district_admins_adminId_key" ON "district_admins"("adminId");

-- CreateIndex
CREATE INDEX "district_admins_districtId_idx" ON "district_admins"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "city_admins_adminId_key" ON "city_admins"("adminId");

-- CreateIndex
CREATE INDEX "city_admins_cityId_idx" ON "city_admins"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "market_masters_adminId_key" ON "market_masters"("adminId");

-- CreateIndex
CREATE INDEX "market_masters_marketId_idx" ON "market_masters"("marketId");

-- CreateIndex
CREATE UNIQUE INDEX "pseudo_market_admins_adminId_key" ON "pseudo_market_admins"("adminId");

-- CreateIndex
CREATE INDEX "pseudo_market_admins_marketId_idx" ON "pseudo_market_admins"("marketId");

-- CreateIndex
CREATE INDEX "pseudo_market_admins_role_idx" ON "pseudo_market_admins"("role");

-- CreateIndex
CREATE UNIQUE INDEX "market_gates_uniqueCode_key" ON "market_gates"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_gates_uniqueCode_idx" ON "market_gates"("uniqueCode");

-- CreateIndex
CREATE INDEX "market_gates_marketId_idx" ON "market_gates"("marketId");

-- CreateIndex
CREATE INDEX "market_gates_gateType_idx" ON "market_gates"("gateType");

-- CreateIndex
CREATE UNIQUE INDEX "market_gates_marketId_gateNumber_key" ON "market_gates"("marketId", "gateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "market_tokens_tokenCode_key" ON "market_tokens"("tokenCode");

-- CreateIndex
CREATE UNIQUE INDEX "market_tokens_shortCode_key" ON "market_tokens"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "market_tokens_tokenValue_key" ON "market_tokens"("tokenValue");

-- CreateIndex
CREATE INDEX "market_tokens_tokenCode_idx" ON "market_tokens"("tokenCode");

-- CreateIndex
CREATE INDEX "market_tokens_shortCode_idx" ON "market_tokens"("shortCode");

-- CreateIndex
CREATE INDEX "market_tokens_tokenType_idx" ON "market_tokens"("tokenType");

-- CreateIndex
CREATE INDEX "market_tokens_marketId_idx" ON "market_tokens"("marketId");

-- CreateIndex
CREATE INDEX "market_tokens_gateId_idx" ON "market_tokens"("gateId");

-- CreateIndex
CREATE INDEX "market_tokens_vendorId_idx" ON "market_tokens"("vendorId");

-- CreateIndex
CREATE INDEX "market_tokens_status_idx" ON "market_tokens"("status");

-- CreateIndex
CREATE INDEX "market_tokens_expiresAt_idx" ON "market_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "market_tokens_issuedAt_idx" ON "market_tokens"("issuedAt");

-- CreateIndex
CREATE INDEX "token_usage_logs_tokenId_idx" ON "token_usage_logs"("tokenId");

-- CreateIndex
CREATE INDEX "token_usage_logs_action_idx" ON "token_usage_logs"("action");

-- CreateIndex
CREATE INDEX "token_usage_logs_usedByUserId_idx" ON "token_usage_logs"("usedByUserId");

-- CreateIndex
CREATE INDEX "token_usage_logs_usedAtGateId_idx" ON "token_usage_logs"("usedAtGateId");

-- CreateIndex
CREATE INDEX "token_usage_logs_createdAt_idx" ON "token_usage_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_qrCode_key" ON "qr_codes"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON "qr_codes"("shortCode");

-- CreateIndex
CREATE INDEX "qr_codes_qrCode_idx" ON "qr_codes"("qrCode");

-- CreateIndex
CREATE INDEX "qr_codes_shortCode_idx" ON "qr_codes"("shortCode");

-- CreateIndex
CREATE INDEX "qr_codes_qrType_idx" ON "qr_codes"("qrType");

-- CreateIndex
CREATE INDEX "qr_codes_entityType_entityId_idx" ON "qr_codes"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "qr_codes_isActive_idx" ON "qr_codes"("isActive");

-- CreateIndex
CREATE INDEX "qr_codes_expiresAt_idx" ON "qr_codes"("expiresAt");

-- CreateIndex
CREATE INDEX "qr_scan_logs_qrCodeId_idx" ON "qr_scan_logs"("qrCodeId");

-- CreateIndex
CREATE INDEX "qr_scan_logs_scannedByUserId_idx" ON "qr_scan_logs"("scannedByUserId");

-- CreateIndex
CREATE INDEX "qr_scan_logs_scannedAtGateId_idx" ON "qr_scan_logs"("scannedAtGateId");

-- CreateIndex
CREATE INDEX "qr_scan_logs_scannedAt_idx" ON "qr_scan_logs"("scannedAt");

-- CreateIndex
CREATE INDEX "qr_scan_logs_isValid_idx" ON "qr_scan_logs"("isValid");

-- CreateIndex
CREATE INDEX "gate_operations_gateId_idx" ON "gate_operations"("gateId");

-- CreateIndex
CREATE INDEX "gate_operations_tokenId_idx" ON "gate_operations"("tokenId");

-- CreateIndex
CREATE INDEX "gate_operations_qrCodeId_idx" ON "gate_operations"("qrCodeId");

-- CreateIndex
CREATE INDEX "gate_operations_inspectorId_idx" ON "gate_operations"("inspectorId");

-- CreateIndex
CREATE INDEX "gate_operations_recordedById_idx" ON "gate_operations"("recordedById");

-- CreateIndex
CREATE INDEX "gate_operations_validatedById_idx" ON "gate_operations"("validatedById");

-- CreateIndex
CREATE INDEX "gate_operations_createdAt_idx" ON "gate_operations"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_idx" ON "roles"("name");

-- CreateIndex
CREATE INDEX "user_roles_userId_idx" ON "user_roles"("userId");

-- CreateIndex
CREATE INDEX "user_roles_roleId_idx" ON "user_roles"("roleId");

-- CreateIndex
CREATE INDEX "user_roles_assignedById_idx" ON "user_roles"("assignedById");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "role_permissions_roleId_idx" ON "role_permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_roleId_resource_action_key" ON "role_permissions"("roleId", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_key" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_email_idx" ON "invitations"("email");

-- CreateIndex
CREATE INDEX "invitations_token_idx" ON "invitations"("token");

-- CreateIndex
CREATE INDEX "invitations_expiresAt_idx" ON "invitations"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "notifications_createdAt_idx" ON "notifications"("createdAt");

-- CreateIndex
CREATE INDEX "kyc_submissions_stakeholderId_idx" ON "kyc_submissions"("stakeholderId");

-- CreateIndex
CREATE INDEX "kyc_submissions_submissionDate_idx" ON "kyc_submissions"("submissionDate");

-- CreateIndex
CREATE INDEX "documents_stakeholderId_idx" ON "documents"("stakeholderId");

-- CreateIndex
CREATE INDEX "documents_verificationStatus_idx" ON "documents"("verificationStatus");

-- CreateIndex
CREATE INDEX "documents_uploadedAt_idx" ON "documents"("uploadedAt");

-- CreateIndex
CREATE INDEX "digital_assets_stakeholderId_idx" ON "digital_assets"("stakeholderId");

-- CreateIndex
CREATE INDEX "digital_assets_assetType_idx" ON "digital_assets"("assetType");

-- CreateIndex
CREATE INDEX "digital_assets_uploadedAt_idx" ON "digital_assets"("uploadedAt");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_referenceId_key" ON "transactions"("referenceId");

-- CreateIndex
CREATE INDEX "transactions_stakeholderId_idx" ON "transactions"("stakeholderId");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "sales_stallId_idx" ON "sales"("stallId");

-- CreateIndex
CREATE INDEX "sales_customerId_idx" ON "sales"("customerId");

-- CreateIndex
CREATE INDEX "sales_saleDate_idx" ON "sales"("saleDate");

-- CreateIndex
CREATE INDEX "sales_paymentStatus_idx" ON "sales"("paymentStatus");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "sale_items_productId_idx" ON "sale_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_barcode_key" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_stallId_idx" ON "products"("stallId");

-- CreateIndex
CREATE INDEX "products_category_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_barcode_idx" ON "products"("barcode");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- CreateIndex
CREATE INDEX "inventory_records_productId_idx" ON "inventory_records"("productId");

-- CreateIndex
CREATE INDEX "inventory_records_recordType_idx" ON "inventory_records"("recordType");

-- CreateIndex
CREATE INDEX "inventory_records_recordedAt_idx" ON "inventory_records"("recordedAt");

-- CreateIndex
CREATE INDEX "stock_movements_marketId_idx" ON "stock_movements"("marketId");

-- CreateIndex
CREATE INDEX "stock_movements_stallId_idx" ON "stock_movements"("stallId");

-- CreateIndex
CREATE INDEX "stock_movements_movementType_idx" ON "stock_movements"("movementType");

-- CreateIndex
CREATE INDEX "stock_movements_createdAt_idx" ON "stock_movements"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tax_payments_receiptNumber_key" ON "tax_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "tax_payments_marketId_idx" ON "tax_payments"("marketId");

-- CreateIndex
CREATE INDEX "tax_payments_vendorId_idx" ON "tax_payments"("vendorId");

-- CreateIndex
CREATE INDEX "tax_payments_taxType_idx" ON "tax_payments"("taxType");

-- CreateIndex
CREATE INDEX "tax_payments_status_idx" ON "tax_payments"("status");

-- CreateIndex
CREATE INDEX "tax_payments_dueDate_idx" ON "tax_payments"("dueDate");

-- CreateIndex
CREATE INDEX "market_taxes_marketId_idx" ON "market_taxes"("marketId");

-- CreateIndex
CREATE INDEX "market_taxes_taxType_idx" ON "market_taxes"("taxType");

-- CreateIndex
CREATE INDEX "market_taxes_isActive_idx" ON "market_taxes"("isActive");

-- CreateIndex
CREATE INDEX "token_generation_configs_marketId_idx" ON "token_generation_configs"("marketId");

-- CreateIndex
CREATE INDEX "token_generation_configs_isActive_idx" ON "token_generation_configs"("isActive");

-- CreateIndex
CREATE INDEX "qr_generation_configs_marketId_idx" ON "qr_generation_configs"("marketId");

-- CreateIndex
CREATE INDEX "qr_generation_configs_isActive_idx" ON "qr_generation_configs"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "scanner_devices_deviceId_key" ON "scanner_devices"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "scanner_devices_serialNumber_key" ON "scanner_devices"("serialNumber");

-- CreateIndex
CREATE INDEX "scanner_devices_deviceId_idx" ON "scanner_devices"("deviceId");

-- CreateIndex
CREATE INDEX "scanner_devices_marketId_idx" ON "scanner_devices"("marketId");

-- CreateIndex
CREATE INDEX "scanner_devices_gateId_idx" ON "scanner_devices"("gateId");

-- CreateIndex
CREATE INDEX "scanner_devices_isActive_idx" ON "scanner_devices"("isActive");

-- CreateIndex
CREATE INDEX "scanner_devices_lastSeen_idx" ON "scanner_devices"("lastSeen");

-- CreateIndex
CREATE INDEX "daily_collections_marketId_date_idx" ON "daily_collections"("marketId", "date");

-- CreateIndex
CREATE INDEX "daily_collections_collectorId_idx" ON "daily_collections"("collectorId");

-- CreateIndex
CREATE INDEX "daily_collections_status_idx" ON "daily_collections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rent_payments_receiptNumber_key" ON "rent_payments"("receiptNumber");

-- CreateIndex
CREATE INDEX "rent_payments_contractId_idx" ON "rent_payments"("contractId");

-- CreateIndex
CREATE INDEX "rent_payments_paymentDate_idx" ON "rent_payments"("paymentDate");

-- CreateIndex
CREATE INDEX "rent_payments_status_idx" ON "rent_payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "rent_contracts_contractNumber_key" ON "rent_contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "rent_contracts_shopId_idx" ON "rent_contracts"("shopId");

-- CreateIndex
CREATE INDEX "rent_contracts_landlordId_idx" ON "rent_contracts"("landlordId");

-- CreateIndex
CREATE INDEX "rent_contracts_tenantId_idx" ON "rent_contracts"("tenantId");

-- CreateIndex
CREATE INDEX "rent_contracts_status_idx" ON "rent_contracts"("status");

-- CreateIndex
CREATE INDEX "rent_contracts_contractNumber_idx" ON "rent_contracts"("contractNumber");

-- CreateIndex
CREATE INDEX "health_inspections_marketId_idx" ON "health_inspections"("marketId");

-- CreateIndex
CREATE INDEX "health_inspections_stallId_idx" ON "health_inspections"("stallId");

-- CreateIndex
CREATE INDEX "health_inspections_inspectionDate_idx" ON "health_inspections"("inspectionDate");

-- CreateIndex
CREATE INDEX "health_inspections_inspectorId_idx" ON "health_inspections"("inspectorId");

-- CreateIndex
CREATE UNIQUE INDEX "market_regulations_regulationNumber_key" ON "market_regulations"("regulationNumber");

-- CreateIndex
CREATE INDEX "market_regulations_marketId_idx" ON "market_regulations"("marketId");

-- CreateIndex
CREATE INDEX "market_regulations_authorityId_idx" ON "market_regulations"("authorityId");

-- CreateIndex
CREATE INDEX "market_regulations_effectiveDate_idx" ON "market_regulations"("effectiveDate");

-- CreateIndex
CREATE INDEX "market_regulations_status_idx" ON "market_regulations"("status");

-- CreateIndex
CREATE UNIQUE INDEX "business_licenses_licenseNumber_key" ON "business_licenses"("licenseNumber");

-- CreateIndex
CREATE INDEX "business_licenses_marketId_idx" ON "business_licenses"("marketId");

-- CreateIndex
CREATE INDEX "business_licenses_licenseeId_idx" ON "business_licenses"("licenseeId");

-- CreateIndex
CREATE INDEX "business_licenses_licenseNumber_idx" ON "business_licenses"("licenseNumber");

-- CreateIndex
CREATE INDEX "business_licenses_expiryDate_idx" ON "business_licenses"("expiryDate");

-- CreateIndex
CREATE INDEX "delivery_items_deliveryId_idx" ON "delivery_items"("deliveryId");

-- CreateIndex
CREATE INDEX "delivery_items_productId_idx" ON "delivery_items"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_invoices_invoiceNumber_key" ON "supplier_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "supplier_invoices_supplierId_idx" ON "supplier_invoices"("supplierId");

-- CreateIndex
CREATE INDEX "supplier_invoices_stallId_idx" ON "supplier_invoices"("stallId");

-- CreateIndex
CREATE INDEX "supplier_invoices_invoiceNumber_idx" ON "supplier_invoices"("invoiceNumber");

-- CreateIndex
CREATE INDEX "supplier_invoices_dueDate_idx" ON "supplier_invoices"("dueDate");

-- CreateIndex
CREATE INDEX "supplier_invoices_paymentStatus_idx" ON "supplier_invoices"("paymentStatus");

-- CreateIndex
CREATE INDEX "invoice_items_invoiceId_idx" ON "invoice_items"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_items_productId_idx" ON "invoice_items"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews"("productId");

-- CreateIndex
CREATE INDEX "product_reviews_customerId_idx" ON "product_reviews"("customerId");

-- CreateIndex
CREATE INDEX "product_reviews_rating_idx" ON "product_reviews"("rating");

-- CreateIndex
CREATE INDEX "product_reviews_status_idx" ON "product_reviews"("status");

-- CreateIndex
CREATE INDEX "complaints_customerId_idx" ON "complaints"("customerId");

-- CreateIndex
CREATE INDEX "complaints_stallId_idx" ON "complaints"("stallId");

-- CreateIndex
CREATE INDEX "complaints_status_idx" ON "complaints"("status");

-- CreateIndex
CREATE INDEX "complaints_priority_idx" ON "complaints"("priority");

-- CreateIndex
CREATE INDEX "complaints_createdAt_idx" ON "complaints"("createdAt");

-- CreateIndex
CREATE INDEX "loyalty_transactions_customerId_idx" ON "loyalty_transactions"("customerId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_type_idx" ON "loyalty_transactions"("type");

-- CreateIndex
CREATE INDEX "loyalty_transactions_referenceId_idx" ON "loyalty_transactions"("referenceId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_createdAt_idx" ON "loyalty_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "guest_entries_guestId_idx" ON "guest_entries"("guestId");

-- CreateIndex
CREATE INDEX "guest_entries_marketId_idx" ON "guest_entries"("marketId");

-- CreateIndex
CREATE INDEX "guest_entries_entryTime_idx" ON "guest_entries"("entryTime");

-- CreateIndex
CREATE INDEX "gate_entries_marketId_idx" ON "gate_entries"("marketId");

-- CreateIndex
CREATE INDEX "gate_entries_gateId_idx" ON "gate_entries"("gateId");

-- CreateIndex
CREATE INDEX "gate_entries_vendorId_idx" ON "gate_entries"("vendorId");

-- CreateIndex
CREATE INDEX "gate_entries_entryTime_idx" ON "gate_entries"("entryTime");

-- CreateIndex
CREATE INDEX "shop_assets_shopId_idx" ON "shop_assets"("shopId");

-- CreateIndex
CREATE INDEX "shop_assets_assetType_idx" ON "shop_assets"("assetType");

-- CreateIndex
CREATE INDEX "shop_assets_isActive_idx" ON "shop_assets"("isActive");

-- CreateIndex
CREATE INDEX "stall_assets_stallId_idx" ON "stall_assets"("stallId");

-- CreateIndex
CREATE INDEX "stall_assets_assetType_idx" ON "stall_assets"("assetType");

-- CreateIndex
CREATE INDEX "stall_assets_isActive_idx" ON "stall_assets"("isActive");

-- CreateIndex
CREATE INDEX "deliveries_supplierId_idx" ON "deliveries"("supplierId");

-- CreateIndex
CREATE INDEX "deliveries_stallId_idx" ON "deliveries"("stallId");

-- CreateIndex
CREATE INDEX "deliveries_deliveryDate_idx" ON "deliveries"("deliveryDate");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "districts" ADD CONSTRAINT "districts_geolocationId_fkey" FOREIGN KEY ("geolocationId") REFERENCES "geolocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "markets" ADD CONSTRAINT "markets_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_levels" ADD CONSTRAINT "market_levels_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_levels" ADD CONSTRAINT "market_levels_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sections" ADD CONSTRAINT "market_sections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sections" ADD CONSTRAINT "market_sections_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "market_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sections" ADD CONSTRAINT "market_sections_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_sections" ADD CONSTRAINT "market_sections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_aisles" ADD CONSTRAINT "market_aisles_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "market_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_aisles" ADD CONSTRAINT "market_aisles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stakeholders" ADD CONSTRAINT "stakeholders_kycVerifiedByAdminId_fkey" FOREIGN KEY ("kycVerifiedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_authorities" ADD CONSTRAINT "market_authorities_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_primaryMarketId_fkey" FOREIGN KEY ("primaryMarketId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_marketMasterApprovalId_fkey" FOREIGN KEY ("marketMasterApprovalId") REFERENCES "market_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "guests_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "market_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "market_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_marketMasterId_fkey" FOREIGN KEY ("marketMasterId") REFERENCES "market_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "market_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES "market_aisles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_marketMasterId_fkey" FOREIGN KEY ("marketMasterId") REFERENCES "market_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "market_levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stalls" ADD CONSTRAINT "stalls_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admins" ADD CONSTRAINT "admins_assignedByAdminId_fkey" FOREIGN KEY ("assignedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "super_admins" ADD CONSTRAINT "super_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "national_admins" ADD CONSTRAINT "national_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_admins" ADD CONSTRAINT "district_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_admins" ADD CONSTRAINT "district_admins_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_admins" ADD CONSTRAINT "city_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_admins" ADD CONSTRAINT "city_admins_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_masters" ADD CONSTRAINT "market_masters_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_masters" ADD CONSTRAINT "market_masters_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pseudo_market_admins" ADD CONSTRAINT "pseudo_market_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pseudo_market_admins" ADD CONSTRAINT "pseudo_market_admins_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_gates" ADD CONSTRAINT "market_gates_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_gates" ADD CONSTRAINT "market_gates_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_gates" ADD CONSTRAINT "market_gates_assignedCounterId_fkey" FOREIGN KEY ("assignedCounterId") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_gates" ADD CONSTRAINT "market_gates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "market_gates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_tokens" ADD CONSTRAINT "market_tokens_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "market_tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_usedByAdminId_fkey" FOREIGN KEY ("usedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_usedAtGateId_fkey" FOREIGN KEY ("usedAtGateId") REFERENCES "market_gates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_usage_logs" ADD CONSTRAINT "token_usage_logs_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES "scanner_devices"("deviceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_codes" ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scannedByAdminId_fkey" FOREIGN KEY ("scannedByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scannedAtGateId_fkey" FOREIGN KEY ("scannedAtGateId") REFERENCES "market_gates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_scan_logs" ADD CONSTRAINT "qr_scan_logs_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES "scanner_devices"("deviceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "market_gates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "market_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "qr_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_operations" ADD CONSTRAINT "gate_operations_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_sentByAdminId_fkey" FOREIGN KEY ("sentByAdminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_districtScopeId_fkey" FOREIGN KEY ("districtScopeId") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_cityScopeId_fkey" FOREIGN KEY ("cityScopeId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_marketScopeId_fkey" FOREIGN KEY ("marketScopeId") REFERENCES "markets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kyc_submissions" ADD CONSTRAINT "kyc_submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_assets" ADD CONSTRAINT "digital_assets_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_assets" ADD CONSTRAINT "digital_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "stakeholders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_records" ADD CONSTRAINT "inventory_records_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_records" ADD CONSTRAINT "inventory_records_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_payments" ADD CONSTRAINT "tax_payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_taxes" ADD CONSTRAINT "market_taxes_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_taxes" ADD CONSTRAINT "market_taxes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_generation_configs" ADD CONSTRAINT "token_generation_configs_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_generation_configs" ADD CONSTRAINT "token_generation_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "qr_generation_configs" ADD CONSTRAINT "qr_generation_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanner_devices" ADD CONSTRAINT "scanner_devices_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanner_devices" ADD CONSTRAINT "scanner_devices_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "market_gates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scanner_devices" ADD CONSTRAINT "scanner_devices_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_collections" ADD CONSTRAINT "daily_collections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_collections" ADD CONSTRAINT "daily_collections_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_collections" ADD CONSTRAINT "daily_collections_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_collections" ADD CONSTRAINT "daily_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "rent_contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_payments" ADD CONSTRAINT "rent_payments_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "market_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_contracts" ADD CONSTRAINT "rent_contracts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_contracts" ADD CONSTRAINT "rent_contracts_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_contracts" ADD CONSTRAINT "rent_contracts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rent_contracts" ADD CONSTRAINT "rent_contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_inspections" ADD CONSTRAINT "health_inspections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_inspections" ADD CONSTRAINT "health_inspections_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_inspections" ADD CONSTRAINT "health_inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "pseudo_market_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_inspections" ADD CONSTRAINT "health_inspections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_regulations" ADD CONSTRAINT "market_regulations_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "market_authorities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "market_regulations" ADD CONSTRAINT "market_regulations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_licenses" ADD CONSTRAINT "business_licenses_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES "market_authorities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_licenses" ADD CONSTRAINT "business_licenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_items" ADD CONSTRAINT "delivery_items_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_invoices" ADD CONSTRAINT "supplier_invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "supplier_invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_entries" ADD CONSTRAINT "guest_entries_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_entries" ADD CONSTRAINT "guest_entries_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guest_entries" ADD CONSTRAINT "guest_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "markets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES "market_gates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES "pseudo_market_admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gate_entries" ADD CONSTRAINT "gate_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_assets" ADD CONSTRAINT "shop_assets_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shop_assets" ADD CONSTRAINT "shop_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stall_assets" ADD CONSTRAINT "stall_assets_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES "stalls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stall_assets" ADD CONSTRAINT "stall_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
