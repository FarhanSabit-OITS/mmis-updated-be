--
-- PostgreSQL database dump
--

\restrict T7l8hYDdo2JH9TOSUWhKJSeKjxPci7UnyfVkgu70e3hxw6VKs77kiHxFiG4z1Bm

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.0

-- Started on 2026-02-09 17:13:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 51867)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 934 (class 1247 OID 51904)
-- Name: AdminLevel; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."AdminLevel" AS ENUM (
    'SUPER_ADMIN',
    'NATIONAL_ADMIN',
    'DISTRICT_ADMIN',
    'CITY_ADMIN',
    'MARKET_MASTER',
    'PSEUDO_MARKET_ADMIN'
);


ALTER TYPE public."AdminLevel" OWNER TO postgres;

--
-- TOC entry 952 (class 1247 OID 52066)
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DocumentType" AS ENUM (
    'ID_PROOF',
    'ADDRESS_PROOF',
    'BUSINESS_LICENSE',
    'TAX_REGISTRATION',
    'BANK_STATEMENT',
    'UTILITY_BILL',
    'PASSPORT',
    'DRIVING_LICENSE',
    'VENDOR_CERTIFICATE',
    'SUPPLIER_CERTIFICATE',
    'QUALITY_CERTIFICATE',
    'INSURANCE_POLICY',
    'OTHER'
);


ALTER TYPE public."DocumentType" OWNER TO postgres;

--
-- TOC entry 973 (class 1247 OID 52200)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 919 (class 1247 OID 72816)
-- Name: InvitationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvitationStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'EXPIRED',
    'REVOKED',
    'USED'
);


ALTER TYPE public."InvitationStatus" OWNER TO postgres;

--
-- TOC entry 916 (class 1247 OID 58792)
-- Name: InvitationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."InvitationType" AS ENUM (
    'USER_REGISTRATION',
    'PASSWORD_RESET',
    'ADMIN_ONBOARDING',
    'VENDOR_REGISTRATION',
    'SUPPLIER_REGISTRATION',
    'KYC_VERIFICATION'
);


ALTER TYPE public."InvitationType" OWNER TO postgres;

--
-- TOC entry 931 (class 1247 OID 51890)
-- Name: KycStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."KycStatus" AS ENUM (
    'NOT_SUBMITTED',
    'PENDING',
    'UNDER_REVIEW',
    'VERIFIED',
    'REJECTED',
    'EXPIRED'
);


ALTER TYPE public."KycStatus" OWNER TO postgres;

--
-- TOC entry 976 (class 1247 OID 52208)
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MaritalStatus" OWNER TO postgres;

--
-- TOC entry 964 (class 1247 OID 52142)
-- Name: MarketTokenType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MarketTokenType" AS ENUM (
    'GATE_ENTRY',
    'GATE_EXIT',
    'STOCK_RECEIPT',
    'STOCK_DISPATCH',
    'PAYMENT_CONFIRMATION',
    'TAX_PAYMENT',
    'RENT_PAYMENT',
    'INSPECTION_APPROVAL',
    'DELIVERY_CONFIRMATION',
    'VEHICLE_PASS',
    'VISITOR_PASS',
    'TEMPORARY_ACCESS'
);


ALTER TYPE public."MarketTokenType" OWNER TO postgres;

--
-- TOC entry 955 (class 1247 OID 52094)
-- Name: MarketType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MarketType" AS ENUM (
    'PERMANENT',
    'TEMPORARY',
    'POP_UP',
    'WEEKLY_BAZAAR',
    'SEASONAL'
);


ALTER TYPE public."MarketType" OWNER TO postgres;

--
-- TOC entry 943 (class 1247 OID 51950)
-- Name: MfaType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."MfaType" AS ENUM (
    'EMAIL',
    'SMS',
    'TOTP',
    'NONE'
);


ALTER TYPE public."MfaType" OWNER TO postgres;

--
-- TOC entry 949 (class 1247 OID 52042)
-- Name: PermissionAction; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PermissionAction" AS ENUM (
    'CREATE',
    'READ',
    'UPDATE',
    'DELETE',
    'MANAGE',
    'APPROVE',
    'VERIFY',
    'EXPORT',
    'IMPORT',
    'ASSIGN',
    'REVOKE'
);


ALTER TYPE public."PermissionAction" OWNER TO postgres;

--
-- TOC entry 946 (class 1247 OID 51998)
-- Name: PermissionResource; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PermissionResource" AS ENUM (
    'SYSTEM',
    'USER',
    'MARKET',
    'CITY',
    'DISTRICT',
    'SHOP',
    'STALL',
    'PRODUCT',
    'INVENTORY',
    'GATE',
    'PAYMENT',
    'TAX',
    'REPORT',
    'SETTINGS',
    'KYC',
    'INVITATION',
    'ROLE',
    'PERMISSION',
    'DOCUMENT',
    'AUDIT',
    'NOTIFICATION'
);


ALTER TYPE public."PermissionResource" OWNER TO postgres;

--
-- TOC entry 937 (class 1247 OID 51918)
-- Name: PseudoMarketRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PseudoMarketRole" AS ENUM (
    'REVENUE_COLLECTOR',
    'HEALTH_INSPECTOR',
    'SECURITY_ADMIN',
    'GATE_COUNTER',
    'STOCK_COUNTER',
    'VAT_PAYMENT_COUNTER',
    'WAREHOUSE_MANAGER',
    'QUALITY_CONTROLLER'
);


ALTER TYPE public."PseudoMarketRole" OWNER TO postgres;

--
-- TOC entry 970 (class 1247 OID 52182)
-- Name: QrCodeType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QrCodeType" AS ENUM (
    'USER_IDENTIFICATION',
    'STAFF_IDENTIFICATION',
    'VEHICLE_PASS',
    'PRODUCT_TRACKING',
    'PAYMENT_RECEIPT',
    'GATE_PASS',
    'DELIVERY_CONFIRMATION',
    'INSPECTION_TAG'
);


ALTER TYPE public."QrCodeType" OWNER TO postgres;

--
-- TOC entry 958 (class 1247 OID 52106)
-- Name: ShopType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ShopType" AS ENUM (
    'RETAIL',
    'WHOLESALE',
    'SERVICE',
    'FOOD',
    'ELECTRONICS',
    'CLOTHING',
    'FURNITURE',
    'JEWELRY',
    'PHARMACY',
    'STATIONERY',
    'OTHER'
);


ALTER TYPE public."ShopType" OWNER TO postgres;

--
-- TOC entry 940 (class 1247 OID 51936)
-- Name: StakeholderType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StakeholderType" AS ENUM (
    'MARKET_AUTHORITY',
    'MEMBER',
    'VENDOR',
    'SUPPLIER',
    'CUSTOMER',
    'GUEST'
);


ALTER TYPE public."StakeholderType" OWNER TO postgres;

--
-- TOC entry 961 (class 1247 OID 52130)
-- Name: StallType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."StallType" AS ENUM (
    'PERMANENT',
    'TEMPORARY',
    'SEASONAL',
    'POP_UP',
    'KIOSK'
);


ALTER TYPE public."StallType" OWNER TO postgres;

--
-- TOC entry 967 (class 1247 OID 52168)
-- Name: TokenStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TokenStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'USED',
    'EXPIRED',
    'REVOKED',
    'INVALIDATED'
);


ALTER TYPE public."TokenStatus" OWNER TO postgres;

--
-- TOC entry 928 (class 1247 OID 51878)
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'PENDING',
    'DELETED'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

--
-- TOC entry 922 (class 1247 OID 72846)
-- Name: VerificationTokenType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."VerificationTokenType" AS ENUM (
    'EMAIL_VERIFICATION',
    'PHONE_VERIFICATION',
    'PASSWORD_RESET',
    'ACCOUNT_RECOVERY',
    'ADMIN_INVITATION',
    'KYC_VERIFICATION'
);


ALTER TYPE public."VerificationTokenType" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 51868)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 52475)
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    id text NOT NULL,
    "userId" text NOT NULL,
    "employeeId" character varying(50),
    "adminLevel" public."AdminLevel" NOT NULL,
    "assignedByAdminId" text,
    "adminSettings" jsonb,
    "canAssignRoles" jsonb,
    "assignedAt" timestamp(3) without time zone,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 52637)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    action character varying(100) NOT NULL,
    "entityType" character varying(50) NOT NULL,
    "entityId" text,
    "oldData" jsonb,
    "newData" jsonb,
    "userId" text,
    "adminId" text,
    "stakeholderId" text,
    "ipAddress" character varying(45),
    "userAgent" character varying(500),
    endpoint character varying(500),
    "httpMethod" character varying(10),
    success boolean DEFAULT true NOT NULL,
    "errorMessage" character varying(500),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 276 (class 1259 OID 52848)
-- Name: business_licenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.business_licenses (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "authorityId" text NOT NULL,
    "licenseeId" text NOT NULL,
    "licenseNumber" character varying(100) NOT NULL,
    "licenseType" character varying(100) NOT NULL,
    "issueDate" timestamp(3) without time zone NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "renewalDate" timestamp(3) without time zone,
    "businessName" character varying(200) NOT NULL,
    "businessType" character varying(100),
    "businessAddress" character varying(500),
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "licenseFee" numeric(12,2),
    "renewalFee" numeric(12,2),
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.business_licenses OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 52293)
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id text NOT NULL,
    "districtId" text NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    "cityType" character varying(50),
    population integer,
    "areaSqKm" double precision,
    mayor character varying(150),
    coordinates jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 52504)
-- Name: city_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.city_admins (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "cityId" text NOT NULL
);


ALTER TABLE public.city_admins OWNER TO postgres;

--
-- TOC entry 281 (class 1259 OID 52896)
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaints (
    id text NOT NULL,
    "customerId" text NOT NULL,
    "stallId" text,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    category character varying(100),
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    "assignedToId" text,
    resolution text,
    "resolvedAt" timestamp(3) without time zone,
    "resolutionNotes" text,
    "customerSatisfaction" integer,
    feedback text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.complaints OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 52415)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "customerCode" character varying(50) NOT NULL,
    "customerType" character varying(50) DEFAULT 'RETAIL'::character varying NOT NULL,
    "loyaltyPoints" integer DEFAULT 0 NOT NULL,
    "totalSpent" numeric(15,2) DEFAULT 0 NOT NULL,
    "visitCount" integer DEFAULT 0 NOT NULL,
    "lastVisit" timestamp(3) without time zone,
    "preferredPaymentMethod" character varying(50) DEFAULT 'CASH'::character varying,
    "discountEligible" boolean DEFAULT false NOT NULL,
    "discountRate" double precision DEFAULT 0.0
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 271 (class 1259 OID 52797)
-- Name: daily_collections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.daily_collections (
    id text NOT NULL,
    "marketId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "collectedAmount" numeric(15,2) NOT NULL,
    "expectedAmount" numeric(15,2),
    "collectionMethod" character varying(50) NOT NULL,
    "bankDepositSlip" character varying(100),
    "collectorId" text NOT NULL,
    "verifiedById" text,
    status character varying(50) DEFAULT 'COLLECTED'::character varying NOT NULL,
    notes text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.daily_collections OWNER TO postgres;

--
-- TOC entry 287 (class 1259 OID 52950)
-- Name: deliveries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.deliveries (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "stallId" text NOT NULL,
    "deliveryDate" timestamp(3) without time zone NOT NULL,
    "expectedDate" timestamp(3) without time zone,
    "receivedDate" timestamp(3) without time zone,
    "vehicleNumber" character varying(50),
    "driverName" character varying(100),
    "driverPhone" character varying(20),
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "deliveryStatus" character varying(50),
    "verifiedById" text,
    "verificationNotes" text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.deliveries OWNER TO postgres;

--
-- TOC entry 277 (class 1259 OID 52858)
-- Name: delivery_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_items (
    id text NOT NULL,
    "deliveryId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    "receivedQuantity" numeric(10,2),
    "qualityStatus" character varying(50),
    "qualityNotes" text
);


ALTER TABLE public.delivery_items OWNER TO postgres;

--
-- TOC entry 259 (class 1259 OID 52677)
-- Name: digital_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.digital_assets (
    id text NOT NULL,
    "stakeholderId" text,
    "assetType" character varying(50) NOT NULL,
    "fileName" character varying(200) NOT NULL,
    "fileUrl" character varying(500) NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" character varying(100) NOT NULL,
    metadata jsonb,
    "uploadedById" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.digital_assets OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 52497)
-- Name: district_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.district_admins (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "districtId" text NOT NULL
);


ALTER TABLE public.district_admins OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 52283)
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id text NOT NULL,
    "geolocationId" text DEFAULT ''::text NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    "districtType" character varying(50),
    population integer,
    "areaSqKm" double precision,
    headquarters character varying(200),
    coordinates jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 52668)
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.documents (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "documentType" public."DocumentType" NOT NULL,
    "fileName" character varying(200) NOT NULL,
    "fileUrl" character varying(500) NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" character varying(100) NOT NULL,
    "verifiedById" text,
    "verificationDate" timestamp(3) without time zone,
    "verificationStatus" character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "verificationNotes" text,
    metadata jsonb,
    "uploadedById" text NOT NULL,
    "uploadedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- TOC entry 284 (class 1259 OID 52923)
-- Name: gate_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gate_entries (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "gateId" text NOT NULL,
    "vendorId" text NOT NULL,
    "stallId" text NOT NULL,
    "entryTime" timestamp(3) without time zone NOT NULL,
    "exitTime" timestamp(3) without time zone,
    "vehicleNumber" character varying(50),
    "vehicleType" character varying(50),
    "driverName" character varying(100),
    "goodsDescription" character varying(500),
    quantity numeric(12,2),
    weight numeric(10,2),
    purpose character varying(100),
    "counterId" text,
    "verificationNotes" text,
    status character varying(50) DEFAULT 'ENTERED'::character varying NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.gate_entries OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 52587)
-- Name: gate_operations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gate_operations (
    id text NOT NULL,
    "gateId" text NOT NULL,
    "operationType" character varying(50) NOT NULL,
    "tokenId" text,
    "qrCodeId" text,
    "entityType" character varying(50),
    "entityId" text,
    "entityName" character varying(150),
    "vehicleNumber" character varying(50),
    "vehicleType" character varying(50),
    "driverName" character varying(100),
    "goodsDescription" character varying(500),
    quantity numeric(12,2),
    weight numeric(10,2),
    "inspectionNotes" text,
    "inspectionResult" character varying(50),
    "inspectorId" text,
    "entryTime" timestamp(3) without time zone,
    "exitTime" timestamp(3) without time zone,
    "durationMinutes" integer,
    status character varying(50) DEFAULT 'COMPLETED'::character varying NOT NULL,
    "isApproved" boolean DEFAULT true NOT NULL,
    "approvalNotes" character varying(500),
    "recordedById" text,
    "validatedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.gate_operations OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 52269)
-- Name: geolocations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.geolocations (
    id text NOT NULL,
    name character varying(200) NOT NULL,
    code character varying(20) NOT NULL,
    country character varying(100) DEFAULT 'Uganda'::character varying NOT NULL,
    "countryCode" character varying(10) DEFAULT 'UG'::character varying NOT NULL,
    timezone character varying(50) DEFAULT 'Africa/Kampala'::character varying NOT NULL,
    currency character varying(10) DEFAULT 'UGX'::character varying NOT NULL,
    language character varying(10) DEFAULT 'en'::character varying NOT NULL,
    "regionType" character varying(50) DEFAULT 'REGION'::character varying NOT NULL,
    population integer,
    "areaSqKm" double precision,
    coordinates jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.geolocations OWNER TO postgres;

--
-- TOC entry 283 (class 1259 OID 52915)
-- Name: guest_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guest_entries (
    id text NOT NULL,
    "guestId" text NOT NULL,
    "marketId" text NOT NULL,
    "entryTime" timestamp(3) without time zone NOT NULL,
    "exitTime" timestamp(3) without time zone,
    purpose character varying(100),
    "visitedStalls" text[],
    "verifiedById" text,
    "verificationNotes" text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.guest_entries OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 52429)
-- Name: guests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guests (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "guestCode" character varying(50) NOT NULL,
    "temporaryId" character varying(100) NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    purpose character varying(100),
    "sponsorId" text,
    "accessAreas" text[]
);


ALTER TABLE public.guests OWNER TO postgres;

--
-- TOC entry 274 (class 1259 OID 52828)
-- Name: health_inspections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.health_inspections (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "stallId" text NOT NULL,
    "inspectionDate" timestamp(3) without time zone NOT NULL,
    "inspectorId" text NOT NULL,
    "hygieneScore" integer NOT NULL,
    "safetyScore" integer NOT NULL,
    "complianceScore" integer NOT NULL,
    "overallScore" integer NOT NULL,
    violations text[],
    "correctiveActions" text[],
    remarks text,
    "followUpDate" timestamp(3) without time zone,
    "followUpRequired" boolean DEFAULT false NOT NULL,
    status character varying(50) DEFAULT 'COMPLETED'::character varying NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.health_inspections OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 52723)
-- Name: inventory_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_records (
    id text NOT NULL,
    "productId" text NOT NULL,
    "recordType" character varying(50) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "previousQuantity" numeric(10,2),
    "newQuantity" numeric(10,2) NOT NULL,
    "referenceId" character varying(100),
    "referenceType" character varying(50),
    notes text,
    "recordedById" text NOT NULL,
    "recordedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.inventory_records OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 52628)
-- Name: invitations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invitations (
    id text NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(20),
    "invitationType" public."InvitationType" NOT NULL,
    token character varying(255) NOT NULL,
    status public."InvitationStatus" DEFAULT 'PENDING'::public."InvitationStatus" NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "acceptedAt" timestamp(3) without time zone,
    "scopeType" character varying(50),
    "scopeId" text,
    "recipientName" character varying(150),
    "roleId" text,
    "sentByAdminId" text,
    "sentByUserId" text,
    "acceptedByUserId" text,
    "vendorId" text,
    "supplierId" text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "districtScopeId" text,
    "cityScopeId" text,
    "marketScopeId" text
);


ALTER TABLE public.invitations OWNER TO postgres;

--
-- TOC entry 279 (class 1259 OID 52876)
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    description character varying(500)
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 52657)
-- Name: kyc_submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kyc_submissions (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "submissionDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status public."KycStatus" DEFAULT 'PENDING'::public."KycStatus" NOT NULL,
    level character varying(20) DEFAULT 'BASIC'::character varying NOT NULL,
    "reviewedById" text,
    "reviewedAt" timestamp(3) without time zone,
    "reviewNotes" text,
    "rejectionReason" text,
    "submittedDocs" text[],
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.kyc_submissions OWNER TO postgres;

--
-- TOC entry 282 (class 1259 OID 52906)
-- Name: loyalty_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_transactions (
    id text NOT NULL,
    "customerId" text NOT NULL,
    points integer NOT NULL,
    type character varying(50) NOT NULL,
    "referenceId" character varying(100),
    "referenceType" character varying(50),
    "expiresAt" timestamp(3) without time zone,
    status character varying(50) DEFAULT 'COMPLETED'::character varying NOT NULL,
    description character varying(500),
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.loyalty_transactions OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 52358)
-- Name: market_aisles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_aisles (
    id text NOT NULL,
    "sectionId" text NOT NULL,
    "uniqueCode" character varying(50) NOT NULL,
    "aisleNumber" character varying(20) NOT NULL,
    name character varying(100),
    "aisleType" character varying(20) DEFAULT 'MAIN'::character varying NOT NULL,
    "isCovered" boolean DEFAULT true NOT NULL,
    "maxStallsPerSide" integer,
    "fireExitAccess" boolean DEFAULT true NOT NULL,
    "emergencyLighting" boolean DEFAULT true NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "lastCleaning" timestamp(3) without time zone,
    "lastMaintenance" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_aisles OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 52382)
-- Name: market_authorities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_authorities (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "authorityName" character varying(200) NOT NULL,
    "registrationNumber" character varying(100) NOT NULL,
    jurisdiction text[],
    "contactPerson" character varying(150),
    "officeAddress" character varying(500),
    website character varying(200)
);


ALTER TABLE public.market_authorities OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 52525)
-- Name: market_gates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_gates (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "uniqueCode" character varying(50) NOT NULL,
    "gateNumber" character varying(20) NOT NULL,
    "gateName" character varying(100),
    "gateType" character varying(20) DEFAULT 'ENTRY'::character varying NOT NULL,
    location character varying(200),
    "accessType" character varying(20) DEFAULT 'ALL'::character varying NOT NULL,
    "allowedVehicleTypes" jsonb NOT NULL,
    "hasScanner" boolean DEFAULT false NOT NULL,
    "hasCamera" boolean DEFAULT false NOT NULL,
    "hasSecurityCheck" boolean DEFAULT false NOT NULL,
    "isOperational" boolean DEFAULT true NOT NULL,
    "operatingHours" jsonb,
    "assignedStaffId" text,
    "assignedCounterId" text,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "lastMaintenance" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_gates OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 52322)
-- Name: market_levels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_levels (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "levelNumber" integer NOT NULL,
    "uniqueCode" character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    "accessType" character varying(50),
    "hasElevator" boolean DEFAULT false NOT NULL,
    "hasEscalator" boolean DEFAULT false NOT NULL,
    "hasRestrooms" boolean DEFAULT true NOT NULL,
    "hasParking" boolean DEFAULT false NOT NULL,
    "totalSections" integer DEFAULT 0 NOT NULL,
    "totalShops" integer DEFAULT 0 NOT NULL,
    "totalStalls" integer DEFAULT 0 NOT NULL,
    "wheelchairAccess" boolean DEFAULT false NOT NULL,
    "emergencyExits" integer DEFAULT 2 NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "isOperational" boolean DEFAULT true NOT NULL,
    "lastInspection" timestamp(3) without time zone,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_levels OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 52511)
-- Name: market_masters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_masters (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "marketId" text NOT NULL
);


ALTER TABLE public.market_masters OWNER TO postgres;

--
-- TOC entry 275 (class 1259 OID 52838)
-- Name: market_regulations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_regulations (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "authorityId" text NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    "regulationNumber" character varying(100),
    "appliesTo" text[],
    "effectiveDate" timestamp(3) without time zone NOT NULL,
    "enforcementDate" timestamp(3) without time zone,
    "complianceLevel" character varying(50),
    penalties jsonb,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_regulations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 52341)
-- Name: market_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_sections (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "levelId" text,
    "uniqueCode" character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    "displayName" character varying(150),
    description text,
    "sectionType" character varying(100) NOT NULL,
    "subType" character varying(100),
    "categoryTags" text[],
    "locationCode" character varying(10),
    "entranceGate" character varying(50),
    "totalShops" integer DEFAULT 0 NOT NULL,
    "totalStalls" integer DEFAULT 0 NOT NULL,
    "occupiedShops" integer DEFAULT 0 NOT NULL,
    "occupiedStalls" integer DEFAULT 0 NOT NULL,
    "maxCapacity" integer,
    "hasAirConditioning" boolean DEFAULT false NOT NULL,
    "hasCommonLighting" boolean DEFAULT true NOT NULL,
    "hasWaterSupply" boolean DEFAULT true NOT NULL,
    "hasSecurityCamera" boolean DEFAULT false NOT NULL,
    "supervisorId" text,
    "assistantIds" text[],
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "openingTime" character varying(10),
    "closingTime" character varying(10),
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "sectionRules" jsonb,
    "specialRequirements" character varying(500)
);


ALTER TABLE public.market_sections OWNER TO postgres;

--
-- TOC entry 267 (class 1259 OID 52748)
-- Name: market_taxes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_taxes (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "taxType" character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    rate numeric(5,2) NOT NULL,
    "calculationType" character varying(20) DEFAULT 'PERCENTAGE'::character varying NOT NULL,
    "appliesTo" text[],
    "minAmount" numeric(12,2),
    "maxAmount" numeric(12,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "effectiveFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "effectiveUntil" timestamp(3) without time zone,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_taxes OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 52540)
-- Name: market_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.market_tokens (
    id text NOT NULL,
    "tokenCode" character varying(100) NOT NULL,
    "tokenType" public."MarketTokenType" NOT NULL,
    "shortCode" character varying(50),
    "tokenValue" character varying(255),
    "displayValue" character varying(100),
    "marketId" text NOT NULL,
    "gateId" text,
    "stallId" text,
    "vendorId" text,
    "customerId" text,
    "adminId" text,
    "userId" text,
    "guestId" text,
    "vehicleNumber" character varying(50),
    "vehicleType" character varying(50),
    "driverName" character varying(100),
    "visitorName" character varying(100),
    "visitorType" character varying(50),
    "transactionId" text,
    amount numeric(12,2),
    currency character varying(10) DEFAULT 'UGX'::character varying NOT NULL,
    purpose character varying(200),
    description character varying(500),
    metadata jsonb,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isSingleUse" boolean DEFAULT true NOT NULL,
    "maxUses" integer DEFAULT 1 NOT NULL,
    "currentUses" integer DEFAULT 0 NOT NULL,
    status public."TokenStatus" DEFAULT 'PENDING'::public."TokenStatus" NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "invalidatedAt" timestamp(3) without time zone,
    "invalidationReason" character varying(500),
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.market_tokens OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 52302)
-- Name: markets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.markets (
    id text NOT NULL,
    "cityId" text NOT NULL,
    name character varying(200) NOT NULL,
    "uniqueCode" character varying(50) NOT NULL,
    "displayName" character varying(200),
    description text,
    address character varying(500) NOT NULL,
    "marketType" public."MarketType" DEFAULT 'PERMANENT'::public."MarketType" NOT NULL,
    categories text[],
    "totalLevels" integer DEFAULT 1 NOT NULL,
    "totalSections" integer DEFAULT 0 NOT NULL,
    "totalShops" integer DEFAULT 0 NOT NULL,
    "totalStalls" integer DEFAULT 0 NOT NULL,
    "occupiedShops" integer DEFAULT 0 NOT NULL,
    "occupiedStalls" integer DEFAULT 0 NOT NULL,
    "maxCapacity" integer,
    "openingTime" character varying(10) DEFAULT '06:00'::character varying NOT NULL,
    "closingTime" character varying(10) DEFAULT '20:00'::character varying NOT NULL,
    "operatingDays" text[] DEFAULT ARRAY['MONDAY'::text, 'TUESDAY'::text, 'WEDNESDAY'::text, 'THURSDAY'::text, 'FRIDAY'::text, 'SATURDAY'::text],
    "is24Hours" boolean DEFAULT false NOT NULL,
    "holidaySchedule" jsonb,
    "contactPhone" character varying(20),
    "contactEmail" character varying(255),
    website character varying(200),
    "managerName" character varying(150),
    "averageRent" numeric(12,2),
    "securityDeposit" numeric(12,2),
    "monthlyMaintenanceFee" numeric(10,2),
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "establishmentDate" timestamp(3) without time zone,
    "lastRenovation" timestamp(3) without time zone,
    notes text,
    "createdByAdminId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.markets OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 52389)
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "membershipNumber" character varying(50) NOT NULL,
    "membershipType" character varying(50) DEFAULT 'REGULAR'::character varying NOT NULL,
    "membershipSince" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "membershipExpiry" timestamp(3) without time zone,
    "businessName" character varying(200) NOT NULL,
    "businessType" character varying(100),
    "registrationNumber" character varying(100) NOT NULL,
    "taxIdNumber" character varying(50),
    "tradeLicenseNumber" character varying(100),
    "yearsInBusiness" integer
);


ALTER TABLE public.members OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 52490)
-- Name: national_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.national_admins (
    id text NOT NULL,
    "adminId" text NOT NULL,
    ministry character varying(200) NOT NULL,
    department character varying(200),
    "officeLocation" character varying(500),
    jurisdiction text[],
    "taxAuthorityId" character varying(50)
);


ALTER TABLE public.national_admins OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 52646)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    "userId" text NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    "isRead" boolean DEFAULT false NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "actionUrl" character varying(500),
    "actionLabel" character varying(100),
    data jsonb,
    "readAt" timestamp(3) without time zone,
    "archivedAt" timestamp(3) without time zone,
    "expiresAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 280 (class 1259 OID 52883)
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    id text NOT NULL,
    "productId" text NOT NULL,
    "customerId" text NOT NULL,
    rating integer NOT NULL,
    title character varying(200),
    comment text,
    "isVerifiedPurchase" boolean DEFAULT false NOT NULL,
    "purchaseDate" timestamp(3) without time zone,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "helpfulVotes" integer DEFAULT 0 NOT NULL,
    "unhelpfulVotes" integer DEFAULT 0 NOT NULL,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- TOC entry 263 (class 1259 OID 52712)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id text NOT NULL,
    "stallId" text NOT NULL,
    name character varying(200) NOT NULL,
    description text,
    category character varying(100) NOT NULL,
    "subCategory" character varying(100),
    unit character varying(20) NOT NULL,
    price numeric(12,2) NOT NULL,
    "costPrice" numeric(12,2),
    "wholesalePrice" numeric(12,2),
    sku character varying(100),
    barcode character varying(100),
    "currentStock" numeric(10,2) DEFAULT 0 NOT NULL,
    "minStockLevel" numeric(10,2),
    "maxStockLevel" numeric(10,2),
    "isActive" boolean DEFAULT true NOT NULL,
    "isApproved" boolean DEFAULT false NOT NULL,
    "supplierId" text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 52518)
-- Name: pseudo_market_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pseudo_market_admins (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "marketId" text NOT NULL,
    role public."PseudoMarketRole" NOT NULL,
    "assignedSection" character varying(100),
    specialization character varying(100),
    "workingHours" jsonb,
    permissions jsonb
);


ALTER TABLE public.pseudo_market_admins OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 52563)
-- Name: qr_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_codes (
    id text NOT NULL,
    "qrCode" character varying(255) NOT NULL,
    "qrType" public."QrCodeType" NOT NULL,
    "shortCode" character varying(50),
    "entityType" character varying(50) NOT NULL,
    "entityId" text NOT NULL,
    "encodedData" jsonb NOT NULL,
    "publicData" jsonb,
    "encryptionKey" character varying(255),
    size integer DEFAULT 256 NOT NULL,
    "errorCorrection" character varying(5) DEFAULT 'M'::character varying NOT NULL,
    "foregroundColor" character varying(10) DEFAULT '#000000'::character varying NOT NULL,
    "backgroundColor" character varying(10) DEFAULT '#FFFFFF'::character varying NOT NULL,
    "logoUrl" character varying(500),
    "scanCount" integer DEFAULT 0 NOT NULL,
    "lastScanned" timestamp(3) without time zone,
    "firstScanned" timestamp(3) without time zone,
    "validFrom" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    "maxScans" integer,
    "requireAuth" boolean DEFAULT false NOT NULL,
    "allowedScanners" text[],
    "createdById" text NOT NULL,
    "userId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.qr_codes OWNER TO postgres;

--
-- TOC entry 269 (class 1259 OID 52773)
-- Name: qr_generation_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_generation_configs (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "qrType" public."QrCodeType" NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    size integer DEFAULT 256 NOT NULL,
    "errorCorrection" character varying(5) DEFAULT 'M'::character varying NOT NULL,
    "foregroundColor" character varying(10) DEFAULT '#000000'::character varying NOT NULL,
    "backgroundColor" character varying(10) DEFAULT '#FFFFFF'::character varying NOT NULL,
    "includeLogo" boolean DEFAULT false NOT NULL,
    "logoUrl" character varying(500),
    "logoSize" integer DEFAULT 50,
    "dataTemplate" jsonb,
    "encryptionMethod" character varying(50),
    "expirationDays" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.qr_generation_configs OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 52579)
-- Name: qr_scan_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.qr_scan_logs (
    id text NOT NULL,
    "qrCodeId" text NOT NULL,
    "scannerId" character varying(100),
    "scannedByUserId" text,
    "scannedByAdminId" text,
    "scannedAtGateId" text,
    "scannedAtCounterId" character varying(100),
    "deviceId" character varying(100),
    "deviceType" character varying(50),
    os character varying(50),
    browser character varying(100),
    "ipAddress" character varying(45),
    "gpsCoordinates" jsonb,
    "isValid" boolean NOT NULL,
    "validationResult" jsonb,
    "errorMessage" character varying(500),
    "responseData" jsonb,
    "scannedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.qr_scan_logs OWNER TO postgres;

--
-- TOC entry 273 (class 1259 OID 52817)
-- Name: rent_contracts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rent_contracts (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "landlordId" text NOT NULL,
    "tenantId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    "endDate" timestamp(3) without time zone NOT NULL,
    "durationMonths" integer NOT NULL,
    "monthlyRent" numeric(12,2) NOT NULL,
    "securityDeposit" numeric(12,2),
    "maintenanceFee" numeric(10,2),
    "paymentDay" integer DEFAULT 1 NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "terminationDate" timestamp(3) without time zone,
    "terminationReason" character varying(500),
    "contractNumber" character varying(100) NOT NULL,
    "termsAndConditions" text,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rent_contracts OWNER TO postgres;

--
-- TOC entry 272 (class 1259 OID 52806)
-- Name: rent_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rent_payments (
    id text NOT NULL,
    "contractId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" character varying(50) NOT NULL,
    "transactionId" character varying(100),
    "receiptNumber" character varying(100),
    "isLate" boolean DEFAULT false NOT NULL,
    "lateFee" numeric(10,2),
    "gracePeriodDays" integer DEFAULT 5,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    notes text,
    "receivedById" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.rent_payments OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 52616)
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_permissions (
    id text NOT NULL,
    "roleId" text NOT NULL,
    resource public."PermissionResource" DEFAULT 'SYSTEM'::public."PermissionResource" NOT NULL,
    action public."PermissionAction" DEFAULT 'CREATE'::public."PermissionAction" NOT NULL,
    conditions jsonb,
    "grantedById" text,
    "grantedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 52597)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    level public."AdminLevel",
    "isSystem" boolean DEFAULT false NOT NULL,
    permissions jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 52705)
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id text NOT NULL,
    "saleId" text NOT NULL,
    "productId" text NOT NULL,
    quantity numeric(10,2) NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    "totalPrice" numeric(12,2) NOT NULL,
    discount numeric(5,2)
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 52695)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id text NOT NULL,
    "stallId" text NOT NULL,
    "customerId" text,
    "totalAmount" numeric(12,2) NOT NULL,
    "taxAmount" numeric(12,2) NOT NULL,
    "discountAmount" numeric(12,2) NOT NULL,
    "netAmount" numeric(12,2) NOT NULL,
    "paymentMethod" character varying(50) NOT NULL,
    "paymentStatus" character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "transactionId" character varying(100),
    "saleDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 52788)
-- Name: scanner_devices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scanner_devices (
    id text NOT NULL,
    "deviceId" character varying(100) NOT NULL,
    "marketId" text NOT NULL,
    "gateId" text,
    name character varying(100) NOT NULL,
    "deviceType" character varying(50) NOT NULL,
    manufacturer character varying(100),
    model character varying(100),
    "serialNumber" character varying(100),
    "firmwareVersion" character varying(50),
    "ipAddress" character varying(45),
    "macAddress" character varying(20),
    "isActive" boolean DEFAULT true NOT NULL,
    "lastSeen" timestamp(3) without time zone,
    "batteryLevel" integer,
    metadata jsonb,
    "registeredById" text NOT NULL,
    "registeredAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.scanner_devices OWNER TO postgres;

--
-- TOC entry 285 (class 1259 OID 52932)
-- Name: shop_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shop_assets (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "assetType" character varying(50) NOT NULL,
    "assetUrl" character varying(500) NOT NULL,
    "fileName" character varying(200) NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" character varying(100) NOT NULL,
    description text,
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shop_assets OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 52436)
-- Name: shops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shops (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "levelId" text,
    "sectionId" text,
    "memberId" text NOT NULL,
    "uniqueCode" character varying(50) NOT NULL,
    "shopNumber" character varying(20) NOT NULL,
    "displayName" character varying(150),
    "shopName" character varying(200) NOT NULL,
    "shopType" public."ShopType" DEFAULT 'RETAIL'::public."ShopType" NOT NULL,
    "subType" character varying(100),
    "categoryTags" text[],
    "locationDescription" character varying(500),
    "accessPoints" text[],
    "hasElectricity" boolean DEFAULT true NOT NULL,
    "hasWaterSupply" boolean DEFAULT true NOT NULL,
    "hasStorage" boolean DEFAULT false NOT NULL,
    "hasAirConditioning" boolean DEFAULT false NOT NULL,
    "hasDisplayWindow" boolean DEFAULT true NOT NULL,
    "hasSecurityShutter" boolean DEFAULT true NOT NULL,
    "electricityMeterNumber" character varying(50),
    "waterMeterNumber" character varying(50),
    "internetConnection" boolean DEFAULT false NOT NULL,
    "monthlyRent" numeric(12,2) NOT NULL,
    "securityDeposit" numeric(12,2),
    "maintenanceFee" numeric(10,2),
    "electricityRate" numeric(8,2),
    "waterRate" numeric(8,2),
    "contractStartDate" timestamp(3) without time zone NOT NULL,
    "contractEndDate" timestamp(3) without time zone NOT NULL,
    "paymentDay" integer DEFAULT 1 NOT NULL,
    "gracePeriodDays" integer DEFAULT 5 NOT NULL,
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "occupationStatus" character varying(50) DEFAULT 'OCCUPIED'::character varying NOT NULL,
    "lastRenovation" timestamp(3) without time zone,
    "inspectionDueDate" timestamp(3) without time zone,
    "inventoryValue" numeric(15,2),
    "createdById" text NOT NULL,
    "marketMasterId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.shops OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 52371)
-- Name: stakeholders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stakeholders (
    id text NOT NULL,
    "userId" text NOT NULL,
    "stakeholderType" public."StakeholderType" NOT NULL,
    "kycStatus" public."KycStatus" DEFAULT 'NOT_SUBMITTED'::public."KycStatus" NOT NULL,
    "kycSubmittedAt" timestamp(3) without time zone,
    "kycVerifiedAt" timestamp(3) without time zone,
    "kycVerifiedByAdminId" text,
    "kycDocuments" jsonb,
    "bankAccountDetails" jsonb,
    "taxComplianceStatus" character varying(50) DEFAULT 'COMPLIANT'::character varying,
    "businessRating" double precision DEFAULT 5.0,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stakeholders OWNER TO postgres;

--
-- TOC entry 286 (class 1259 OID 52941)
-- Name: stall_assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stall_assets (
    id text NOT NULL,
    "stallId" text NOT NULL,
    "assetType" character varying(50) NOT NULL,
    "assetUrl" character varying(500) NOT NULL,
    "fileName" character varying(200) NOT NULL,
    "fileSize" integer NOT NULL,
    "mimeType" character varying(100) NOT NULL,
    description text,
    tags text[],
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stall_assets OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 52456)
-- Name: stalls; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stalls (
    id text NOT NULL,
    "shopId" text NOT NULL,
    "vendorId" text NOT NULL,
    "sectionId" text,
    "aisleId" text,
    "levelId" text,
    "uniqueCode" character varying(50) NOT NULL,
    "stallNumber" character varying(20) NOT NULL,
    "displayName" character varying(150),
    "stallType" public."StallType" DEFAULT 'PERMANENT'::public."StallType" NOT NULL,
    category character varying(100) NOT NULL,
    "subCategories" text[],
    specialization character varying(100),
    "hasDisplayCounter" boolean DEFAULT true NOT NULL,
    "hasStorage" boolean DEFAULT false NOT NULL,
    "hasLighting" boolean DEFAULT true NOT NULL,
    "hasPowerOutlet" boolean DEFAULT true NOT NULL,
    "hasCashRegister" boolean DEFAULT false NOT NULL,
    "dailyRate" numeric(10,2) NOT NULL,
    "monthlyRate" numeric(12,2),
    "securityDeposit" numeric(12,2),
    "billingCycle" character varying(20) DEFAULT 'DAILY'::character varying NOT NULL,
    "contractStartDate" timestamp(3) without time zone NOT NULL,
    "contractEndDate" timestamp(3) without time zone,
    "agreementTerms" jsonb,
    "openingTime" character varying(10),
    "closingTime" character varying(10),
    "operatingDays" text[] DEFAULT ARRAY['MONDAY'::text, 'TUESDAY'::text, 'WEDNESDAY'::text, 'THURSDAY'::text, 'FRIDAY'::text, 'SATURDAY'::text],
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    "operationalStatus" character varying(50) DEFAULT 'OPERATIONAL'::character varying NOT NULL,
    "lastStockCheck" timestamp(3) without time zone,
    "lastCleaning" timestamp(3) without time zone,
    "visitCount" integer DEFAULT 0 NOT NULL,
    "qrCode" character varying(100),
    "createdById" text NOT NULL,
    "marketMasterId" text,
    "marketId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stalls OWNER TO postgres;

--
-- TOC entry 265 (class 1259 OID 52731)
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "stallId" text,
    "movementType" character varying(50) NOT NULL,
    quantity numeric(10,2) NOT NULL,
    unit character varying(20) NOT NULL,
    "productName" character varying(200) NOT NULL,
    "productCategory" character varying(100),
    "vehicleNumber" character varying(50),
    "vehicleType" character varying(50),
    "driverName" character varying(100),
    "inspectedById" text,
    "inspectionNotes" text,
    "inspectionStatus" character varying(50),
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 52483)
-- Name: super_admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.super_admins (
    id text NOT NULL,
    "adminId" text NOT NULL,
    "globalSettings" jsonb,
    "systemAccessLogs" jsonb,
    "apiKeys" jsonb,
    "backupSettings" jsonb
);


ALTER TABLE public.super_admins OWNER TO postgres;

--
-- TOC entry 278 (class 1259 OID 52865)
-- Name: supplier_invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.supplier_invoices (
    id text NOT NULL,
    "supplierId" text NOT NULL,
    "stallId" text NOT NULL,
    "invoiceNumber" character varying(100) NOT NULL,
    "invoiceDate" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    subtotal numeric(15,2) NOT NULL,
    "taxAmount" numeric(12,2),
    "totalAmount" numeric(15,2) NOT NULL,
    "amountPaid" numeric(15,2) DEFAULT 0 NOT NULL,
    "amountDue" numeric(15,2) NOT NULL,
    "paymentStatus" character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" character varying(50),
    status character varying(50) DEFAULT 'ACTIVE'::character varying NOT NULL,
    notes text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.supplier_invoices OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 52406)
-- Name: suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suppliers (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "supplierCode" character varying(50) NOT NULL,
    "businessName" character varying(200) NOT NULL,
    "supplierType" character varying(50) DEFAULT 'WHOLESALER'::character varying NOT NULL,
    "licenseNumber" character varying(100),
    "taxId" character varying(50),
    "warehouseAddress" character varying(500),
    "deliveryRadius" integer,
    "minimumOrder" numeric(10,2),
    "paymentTerms" character varying(50) DEFAULT 'NET30'::character varying
);


ALTER TABLE public.suppliers OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 52739)
-- Name: tax_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tax_payments (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "vendorId" text NOT NULL,
    "taxType" character varying(50) NOT NULL,
    amount numeric(12,2) NOT NULL,
    "periodStart" timestamp(3) without time zone NOT NULL,
    "periodEnd" timestamp(3) without time zone NOT NULL,
    "dueDate" timestamp(3) without time zone NOT NULL,
    "paymentDate" timestamp(3) without time zone,
    "paymentMethod" character varying(50),
    "transactionId" character varying(100),
    "receiptNumber" character varying(100),
    "collectedById" text,
    "collectionNotes" text,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.tax_payments OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 52759)
-- Name: token_generation_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token_generation_configs (
    id text NOT NULL,
    "marketId" text NOT NULL,
    "tokenType" public."MarketTokenType" NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    prefix character varying(10),
    suffix character varying(10),
    length integer DEFAULT 10 NOT NULL,
    charset character varying(50) DEFAULT 'alphanumeric'::character varying NOT NULL,
    "expirationHours" integer,
    "isSingleUse" boolean DEFAULT true NOT NULL,
    "maxUses" integer DEFAULT 1,
    "requireValidation" boolean DEFAULT false NOT NULL,
    "validationRules" jsonb,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.token_generation_configs OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 52555)
-- Name: token_usage_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.token_usage_logs (
    id text NOT NULL,
    "tokenId" text NOT NULL,
    action character varying(50) NOT NULL,
    "usedByUserId" text,
    "usedByAdminId" text,
    "usedAtGateId" text,
    "usedAtCounterId" character varying(100),
    "deviceId" character varying(100),
    "deviceType" character varying(50),
    "scannerId" character varying(100),
    "ipAddress" character varying(45),
    "gpsCoordinates" jsonb,
    "isValid" boolean NOT NULL,
    "validationMessage" character varying(500),
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.token_usage_logs OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 52685)
-- Name: transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transactions (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    type character varying(50) NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying(10) DEFAULT 'UGX'::character varying NOT NULL,
    status character varying(50) DEFAULT 'COMPLETED'::character varying NOT NULL,
    "referenceId" character varying(100),
    "externalReference" character varying(100),
    "paymentMethod" character varying(50),
    "paymentGateway" character varying(100),
    "gatewayResponse" jsonb,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.transactions OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 52231)
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id text NOT NULL,
    "userId" text NOT NULL,
    title character varying(10),
    "firstName" character varying(100) NOT NULL,
    "middleName" character varying(100),
    "lastName" character varying(100) NOT NULL,
    "displayName" character varying(150),
    gender public."Gender",
    "dateOfBirth" timestamp(3) without time zone,
    age integer,
    "nationalId" character varying(50),
    "nationalIdType" character varying(20) DEFAULT 'NIN'::character varying,
    "passportNumber" character varying(50),
    "passportCountry" character varying(100),
    "taxIdNumber" character varying(50),
    "primaryPhone" character varying(20) NOT NULL,
    "secondaryPhone" character varying(20),
    "emergencyPhone" character varying(20),
    "emergencyContact" character varying(100),
    "primaryEmail" character varying(255) NOT NULL,
    "secondaryEmail" character varying(255),
    "residentialAddress" character varying(500),
    "permanentAddress" character varying(500),
    city character varying(100),
    district character varying(100),
    country character varying(100) DEFAULT 'Uganda'::character varying NOT NULL,
    "postalCode" character varying(20),
    occupation character varying(100),
    "companyName" character varying(200),
    designation character varying(100),
    "yearsOfExperience" integer,
    "maritalStatus" public."MaritalStatus",
    "spouseName" character varying(100),
    religion character varying(50),
    language text[] DEFAULT ARRAY['en'::text, 'sw'::text],
    "profilePictureUrl" character varying(500),
    "signatureUrl" character varying(500),
    "preferredLanguage" character varying(10) DEFAULT 'en'::character varying NOT NULL,
    timezone character varying(50) DEFAULT 'Africa/Kampala'::character varying NOT NULL,
    currency character varying(10) DEFAULT 'UGX'::character varying NOT NULL,
    "notificationPreferences" jsonb,
    "verificationLevel" character varying(20) DEFAULT 'BASIC'::character varying NOT NULL,
    "verifiedByAdminId" text,
    "verificationDate" timestamp(3) without time zone,
    "personalQRCode" character varying(100),
    "qrCodeExpiry" timestamp(3) without time zone,
    "bankName" character varying(100),
    "bankAccountNumber" character varying(50),
    "bankAccountName" character varying(150),
    metadata jsonb,
    version integer DEFAULT 1 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "lastProfileUpdate" timestamp(3) without time zone
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 52606)
-- Name: user_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_roles (
    id text NOT NULL,
    "userId" text NOT NULL,
    "roleId" text NOT NULL,
    "assignedById" text,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_roles OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 52258)
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sessionToken" character varying(255) NOT NULL,
    "refreshToken" character varying(255),
    "deviceId" character varying(100),
    "deviceName" character varying(100),
    "deviceType" character varying(50),
    os character varying(50),
    browser character varying(100),
    "ipAddress" character varying(45),
    city character varying(100),
    country character varying(100),
    coordinates jsonb,
    "mfaVerified" boolean DEFAULT false NOT NULL,
    "lastActivity" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "logoutReason" character varying(100),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "loggedOutAt" timestamp(3) without time zone
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 52217)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email character varying(255) NOT NULL,
    "passwordHash" character varying(255) NOT NULL,
    phone character varying(20),
    "mfaEnabled" boolean DEFAULT false NOT NULL,
    "mfaType" public."MfaType" DEFAULT 'NONE'::public."MfaType" NOT NULL,
    "totpSecret" character varying(255),
    "totpBackupCodes" text[],
    "lastTotpUsed" timestamp(3) without time zone,
    "emailVerified" boolean DEFAULT false NOT NULL,
    "phoneVerified" boolean DEFAULT false NOT NULL,
    "lastEmailVerificationSent" timestamp(3) without time zone,
    "lastPhoneVerificationSent" timestamp(3) without time zone,
    "loginAttempts" integer DEFAULT 0 NOT NULL,
    "lockUntil" timestamp(3) without time zone,
    "lastLogin" timestamp(3) without time zone,
    "lastPasswordChange" timestamp(3) without time zone,
    "passwordHistory" text[],
    status public."UserStatus" DEFAULT 'PENDING'::public."UserStatus" NOT NULL,
    "deactivationReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "deletedAt" timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 52398)
-- Name: vendors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendors (
    id text NOT NULL,
    "stakeholderId" text NOT NULL,
    "vendorCode" character varying(50) NOT NULL,
    "businessName" character varying(200) NOT NULL,
    "businessType" character varying(100),
    "businessLicenseNumber" character varying(100),
    "taxIdNumber" character varying(50),
    "vatRegistered" boolean DEFAULT false NOT NULL,
    "vatNumber" character varying(50),
    "yearsInBusiness" integer,
    "preferredMarkets" text[],
    "primaryMarketId" text,
    "marketMasterApprovalId" text
);


ALTER TABLE public.vendors OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 52247)
-- Name: verification_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.verification_tokens (
    id text NOT NULL,
    token character varying(255) NOT NULL,
    "tokenType" public."VerificationTokenType" NOT NULL,
    "userId" text,
    email character varying(255),
    phone character varying(20),
    "maxAttempts" integer DEFAULT 3 NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    "isUsed" boolean DEFAULT false NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    "usedAt" timestamp(3) without time zone,
    "ipAddress" character varying(45),
    "userAgent" character varying(500),
    location jsonb,
    "purposeData" jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.verification_tokens OWNER TO postgres;

--
-- TOC entry 5541 (class 0 OID 51868)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
670020b5-08f6-4f05-b511-d37f70c28950	968017c6bfa693e4f5275646c058d97d37b1cf193860ce4e1d34b273d92608e0	2025-12-04 12:31:06.385711+00	20251204112652_init_new_schema	\N	\N	2025-12-04 12:31:03.513379+00	1
ffeaccb5-ad68-416f-ac61-602d9df29071	b0981398411e191b587b316a2092d4460372a1c032611c3b22576eb878ebcc7b	2025-12-04 12:36:01.178574+00	20251204123557_update_invitation_type	\N	\N	2025-12-04 12:35:59.538609+00	1
caca418f-ba78-484d-af1c-3305091e985a	b43b898cc3bcbd212d93f2839067ff08095d7422812c3dba1e8bbe42dcde7fc7	2025-12-09 08:43:44.852213+00	20251209084342_updated_invitation_status	\N	\N	2025-12-09 08:43:43.447295+00	1
b048648a-77c2-4665-880e-3aba76960b79	858368bbd50a0df3b2b74b35058ca85447668d47cd0585ab644ef1dc38349e6d	2026-01-21 07:07:53.844691+00	20260121070750_add_user_registration_type	\N	\N	2026-01-21 07:07:52.181325+00	1
\.


--
-- TOC entry 5562 (class 0 OID 52475)
-- Dependencies: 238
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (id, "userId", "employeeId", "adminLevel", "assignedByAdminId", "adminSettings", "canAssignRoles", "assignedAt", notes, "createdAt", "updatedAt") FROM stdin;
939d2d2f-5739-4b0e-b803-a6c851f3f34f	e911d798-d05f-4a17-9121-bdc1f1c4076d	\N	SUPER_ADMIN	\N	\N	\N	\N	Created via create-superuser script	2026-01-21 07:46:04.953	2026-01-21 07:46:04.953
971197c4-bec4-46c6-a25e-601ee06fd773	34469dbb-5d1d-42a8-85c1-33ea569eb667	\N	MARKET_MASTER	\N	\N	\N	\N	Auto-promoted via email domain	2026-01-21 07:51:08.224	2026-01-21 07:51:08.224
05c76a46-8675-49dd-baea-6f84d4e5a3dd	eae11fc4-36ad-4ac6-b69e-c7a4e0b05e9f	\N	SUPER_ADMIN	\N	\N	\N	\N	Created via create-superuser script	2026-01-21 08:00:41.704	2026-01-21 08:00:41.704
00b42b9f-f638-40a7-bb52-f8af9d74b8bf	adb5cc70-a1a1-4b3a-a628-c07910a7113e	\N	SUPER_ADMIN	\N	\N	\N	\N	Created via create-superuser script	2026-01-28 08:45:40.154	2026-01-28 08:45:40.154
0e258428-ce59-448f-ba57-bc11b0cf7e4e	7f283c4c-82a9-4332-a239-cd218f9fd727	\N	SUPER_ADMIN	\N	\N	\N	\N	Created via create-superuser script	2026-01-28 09:03:00.425	2026-01-28 09:03:00.425
\.


--
-- TOC entry 5579 (class 0 OID 52637)
-- Dependencies: 255
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, action, "entityType", "entityId", "oldData", "newData", "userId", "adminId", "stakeholderId", "ipAddress", "userAgent", endpoint, "httpMethod", success, "errorMessage", "createdAt") FROM stdin;
\.


--
-- TOC entry 5600 (class 0 OID 52848)
-- Dependencies: 276
-- Data for Name: business_licenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.business_licenses (id, "marketId", "authorityId", "licenseeId", "licenseNumber", "licenseType", "issueDate", "expiryDate", "renewalDate", "businessName", "businessType", "businessAddress", status, "isActive", "licenseFee", "renewalFee", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5548 (class 0 OID 52293)
-- Dependencies: 224
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, "districtId", name, code, "cityType", population, "areaSqKm", mayor, coordinates, metadata, "createdAt", "updatedAt") FROM stdin;
1613b2e2-087b-49b2-b963-af55d03e8199	6397c377-5f59-4058-b57b-5492143baf9d	Test City 1767696771795	TC506	\N	\N	\N	\N	\N	\N	2026-01-06 10:52:51.796	2026-01-06 10:52:51.796
3b780aac-8a20-4fcd-9b7e-bd5454ebc65d	bbaac5bc-2793-4b75-940c-dacc92be0d9b	Test City 1767696806237	TC599	\N	\N	\N	\N	\N	\N	2026-01-06 10:53:26.239	2026-01-06 10:53:26.239
617833fc-a2d6-47e4-810d-a330f25764d0	19982eb8-aad1-4dce-8972-f392ba766560	Test City 1767696856464	TC282	\N	\N	\N	\N	\N	\N	2026-01-06 10:54:16.465	2026-01-06 10:54:16.465
982cc33b-77db-41ef-9743-70cbdf0a0008	47b0fe58-01a3-43ed-a846-f6dae3046c6d	Test City 1767696994784	TC379	\N	\N	\N	\N	\N	\N	2026-01-06 10:56:34.785	2026-01-06 10:56:34.785
88cb46ab-a19a-4277-bede-2cbf5ed03f37	5dd0eb88-6b57-473b-8e96-af6a90c22091	Test City 1767697050835	TC608	\N	\N	\N	\N	\N	\N	2026-01-06 10:57:30.836	2026-01-06 10:57:30.836
fadfcd3b-2e28-419e-8675-6a91c7e18ea5	8d48b39e-b937-46c0-85d8-f4f0791878c9	Test City 1767697109006	TC502	\N	\N	\N	\N	\N	\N	2026-01-06 10:58:29.008	2026-01-06 10:58:29.008
c1	d1	Kampala	KLA	\N	\N	\N	\N	\N	\N	2026-02-06 11:55:24.051	2026-02-06 11:55:24.051
\.


--
-- TOC entry 5566 (class 0 OID 52504)
-- Dependencies: 242
-- Data for Name: city_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.city_admins (id, "adminId", "cityId") FROM stdin;
\.


--
-- TOC entry 5605 (class 0 OID 52896)
-- Dependencies: 281
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, "customerId", "stallId", title, description, category, status, priority, "assignedToId", resolution, "resolvedAt", "resolutionNotes", "customerSatisfaction", feedback, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5558 (class 0 OID 52415)
-- Dependencies: 234
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, "stakeholderId", "customerCode", "customerType", "loyaltyPoints", "totalSpent", "visitCount", "lastVisit", "preferredPaymentMethod", "discountEligible", "discountRate") FROM stdin;
\.


--
-- TOC entry 5595 (class 0 OID 52797)
-- Dependencies: 271
-- Data for Name: daily_collections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.daily_collections (id, "marketId", date, "collectedAmount", "expectedAmount", "collectionMethod", "bankDepositSlip", "collectorId", "verifiedById", status, notes, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5611 (class 0 OID 52950)
-- Dependencies: 287
-- Data for Name: deliveries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.deliveries (id, "supplierId", "stallId", "deliveryDate", "expectedDate", "receivedDate", "vehicleNumber", "driverName", "driverPhone", status, "deliveryStatus", "verifiedById", "verificationNotes", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5601 (class 0 OID 52858)
-- Dependencies: 277
-- Data for Name: delivery_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.delivery_items (id, "deliveryId", "productId", quantity, "unitPrice", "totalPrice", "receivedQuantity", "qualityStatus", "qualityNotes") FROM stdin;
\.


--
-- TOC entry 5583 (class 0 OID 52677)
-- Dependencies: 259
-- Data for Name: digital_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.digital_assets (id, "stakeholderId", "assetType", "fileName", "fileUrl", "fileSize", "mimeType", metadata, "uploadedById", "uploadedAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5565 (class 0 OID 52497)
-- Dependencies: 241
-- Data for Name: district_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.district_admins (id, "adminId", "districtId") FROM stdin;
\.


--
-- TOC entry 5547 (class 0 OID 52283)
-- Dependencies: 223
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.districts (id, "geolocationId", name, code, "districtType", population, "areaSqKm", headquarters, coordinates, metadata, "createdAt", "updatedAt") FROM stdin;
6397c377-5f59-4058-b57b-5492143baf9d	cc0ae423-30eb-48f0-a53a-93a2450338ef	TestDist 1767696771795	TD1	\N	\N	\N	\N	\N	\N	2026-01-06 10:52:51.796	2026-01-06 10:52:51.796
bbaac5bc-2793-4b75-940c-dacc92be0d9b	74459629-ad3b-404e-a92b-f8e926806f8e	TestDist 1767696806237	TD357	\N	\N	\N	\N	\N	\N	2026-01-06 10:53:26.239	2026-01-06 10:53:26.239
19982eb8-aad1-4dce-8972-f392ba766560	9a537dc3-51ac-40bb-a10c-f64cca0c5ba2	TestDist 1767696856464	TD135	\N	\N	\N	\N	\N	\N	2026-01-06 10:54:16.465	2026-01-06 10:54:16.465
47b0fe58-01a3-43ed-a846-f6dae3046c6d	e25ca2a1-ea3f-4bae-b4d0-78a0937fe023	TestDist 1767696994784	TD87	\N	\N	\N	\N	\N	\N	2026-01-06 10:56:34.785	2026-01-06 10:56:34.785
5dd0eb88-6b57-473b-8e96-af6a90c22091	6f326424-806d-4300-8e43-7816d44fe670	TestDist 1767697050835	TD399	\N	\N	\N	\N	\N	\N	2026-01-06 10:57:30.836	2026-01-06 10:57:30.836
8d48b39e-b937-46c0-85d8-f4f0791878c9	50650057-8cd4-4b38-9422-0583b90a5d84	TestDist 1767697109006	TD592	\N	\N	\N	\N	\N	\N	2026-01-06 10:58:29.008	2026-01-06 10:58:29.008
d1	g1	Kampala District	KLA-DIST	\N	\N	\N	\N	\N	\N	2026-02-06 11:55:21.477	2026-02-06 11:55:21.477
\.


--
-- TOC entry 5582 (class 0 OID 52668)
-- Dependencies: 258
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.documents (id, "stakeholderId", "documentType", "fileName", "fileUrl", "fileSize", "mimeType", "verifiedById", "verificationDate", "verificationStatus", "verificationNotes", metadata, "uploadedById", "uploadedAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5608 (class 0 OID 52923)
-- Dependencies: 284
-- Data for Name: gate_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_entries (id, "marketId", "gateId", "vendorId", "stallId", "entryTime", "exitTime", "vehicleNumber", "vehicleType", "driverName", "goodsDescription", quantity, weight, purpose, "counterId", "verificationNotes", status, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5574 (class 0 OID 52587)
-- Dependencies: 250
-- Data for Name: gate_operations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate_operations (id, "gateId", "operationType", "tokenId", "qrCodeId", "entityType", "entityId", "entityName", "vehicleNumber", "vehicleType", "driverName", "goodsDescription", quantity, weight, "inspectionNotes", "inspectionResult", "inspectorId", "entryTime", "exitTime", "durationMinutes", status, "isApproved", "approvalNotes", "recordedById", "validatedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5546 (class 0 OID 52269)
-- Dependencies: 222
-- Data for Name: geolocations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.geolocations (id, name, code, country, "countryCode", timezone, currency, language, "regionType", population, "areaSqKm", coordinates, metadata, "createdAt", "updatedAt") FROM stdin;
cc0ae423-30eb-48f0-a53a-93a2450338ef	Test Region 1767696768798	TR337	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:52:51.145	2026-01-06 10:52:51.145
74459629-ad3b-404e-a92b-f8e926806f8e	Test Region 1767696803240	TR984	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:53:25.609	2026-01-06 10:53:25.609
9a537dc3-51ac-40bb-a10c-f64cca0c5ba2	Test Region 1767696853531	TR150	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:54:15.841	2026-01-06 10:54:15.841
e25ca2a1-ea3f-4bae-b4d0-78a0937fe023	Test Region 1767696991798	TR789	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:56:34.14	2026-01-06 10:56:34.14
6f326424-806d-4300-8e43-7816d44fe670	Test Region 1767697047905	TR648	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:57:30.201	2026-01-06 10:57:30.201
50650057-8cd4-4b38-9422-0583b90a5d84	Test Region 1767697105972	TR750	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-01-06 10:58:28.359	2026-01-06 10:58:28.359
g1	Uganda	UG	Uganda	UG	Africa/Kampala	UGX	en	REGION	\N	\N	\N	\N	2026-02-06 11:55:18.86	2026-02-06 11:55:18.86
\.


--
-- TOC entry 5607 (class 0 OID 52915)
-- Dependencies: 283
-- Data for Name: guest_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guest_entries (id, "guestId", "marketId", "entryTime", "exitTime", purpose, "visitedStalls", "verifiedById", "verificationNotes", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5559 (class 0 OID 52429)
-- Dependencies: 235
-- Data for Name: guests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guests (id, "stakeholderId", "guestCode", "temporaryId", "expiryDate", purpose, "sponsorId", "accessAreas") FROM stdin;
\.


--
-- TOC entry 5598 (class 0 OID 52828)
-- Dependencies: 274
-- Data for Name: health_inspections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.health_inspections (id, "marketId", "stallId", "inspectionDate", "inspectorId", "hygieneScore", "safetyScore", "complianceScore", "overallScore", violations, "correctiveActions", remarks, "followUpDate", "followUpRequired", status, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5588 (class 0 OID 52723)
-- Dependencies: 264
-- Data for Name: inventory_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_records (id, "productId", "recordType", quantity, "previousQuantity", "newQuantity", "referenceId", "referenceType", notes, "recordedById", "recordedAt") FROM stdin;
\.


--
-- TOC entry 5578 (class 0 OID 52628)
-- Dependencies: 254
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invitations (id, email, phone, "invitationType", token, status, "expiresAt", "acceptedAt", "scopeType", "scopeId", "recipientName", "roleId", "sentByAdminId", "sentByUserId", "acceptedByUserId", "vendorId", "supplierId", metadata, "createdAt", "updatedAt", "districtScopeId", "cityScopeId", "marketScopeId") FROM stdin;
3f7cec48-7f61-4ffe-aa30-45d65efc7e8c	azwadfawadhasan@gmail.com	\N	USER_REGISTRATION	0cd78fac30c107e77aa6172b4dfd644ef4327fbf5c35b44db569a68d3f23cef4	ACCEPTED	2025-12-24 06:45:44.573	2025-12-23 06:47:54.243	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL"}	2025-12-23 06:45:44.574	2025-12-23 06:47:54.244	\N	\N	\N
3dda4784-0e3b-48f8-99c7-9713fdd32ca8	azwad@gmail.com	\N	USER_REGISTRATION	34e464524b4b71d16deac42359d2f18055b2ea8a511ff73819e0bd2234a5e893	PENDING	2026-01-22 07:08:15.467	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL"}	2026-01-21 07:08:15.469	2026-01-21 07:08:15.469	\N	\N	\N
6a2be39a-c02a-4d0e-ac63-599147d7ac10	test_mm_1768981848989@mms.ug	\N	USER_REGISTRATION	d2d2458ee0aad15baaedb112644665eea0c55735980adb078cab1c46ee46015f	ACCEPTED	2026-01-22 07:50:56.15	2026-01-21 07:51:06.021	\N	\N	\N	\N	\N	\N	34469dbb-5d1d-42a8-85c1-33ea569eb667	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "Guest", "businessName": "Test Master"}	2026-01-21 07:50:56.152	2026-01-21 07:51:06.023	\N	\N	\N
f1bc20c1-8426-4963-ab30-8679f1eb5a6a	test_vendor_1768981873908@example.com	\N	USER_REGISTRATION	d89d65b9a68f86b45e91a9251c093e3c33072bd604bc086a3e56ad97278c5c9b	ACCEPTED	2026-01-22 07:51:16.49	2026-01-21 07:51:22.761	\N	\N	\N	\N	\N	\N	b9adab58-6828-4f90-9256-71423b9ad32e	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "Vendor", "businessName": "My Awesome Shop"}	2026-01-21 07:51:16.492	2026-01-21 07:51:22.763	\N	\N	\N
e18682d5-9727-4f73-93c1-2521c6031516	test_vendor@gmail.com	\N	USER_REGISTRATION	d3855be258cdadab86c9bc503f1403677745d2941e13544016eb8e0ca2cb2d4e	PENDING	2026-01-22 09:04:30.957	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "VENDOR", "businessName": "test_vendor"}	2026-01-21 09:04:30.959	2026-01-21 09:04:30.959	\N	\N	\N
d9ef5fb8-1aeb-4326-948f-8ae10fa2bd9e	stiodev123@gmail.com	\N	USER_REGISTRATION	c643dd2aa81c9b5b5076edab04b79772d1e6cd841aa091168606fda9d579c8d2	PENDING	2026-01-22 09:05:54.877	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "VENDOR", "businessName": "test_vendor"}	2026-01-21 09:05:54.878	2026-01-21 09:05:54.878	\N	\N	\N
25b23364-92eb-40af-825e-d40d5b429c91	azwadfawadhasan@gmail.com	\N	USER_REGISTRATION	ab7df99568e3dd7df172bbce2edc3a890495bf6260f7f10ea5534b90f727ab14	ACCEPTED	2026-02-10 10:58:54.961	2026-02-09 10:59:28.21	\N	\N	\N	\N	\N	\N	e3cbfe58-c3e9-4335-9b30-88af8689f296	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "Supplier", "businessName": "azwad_supplier"}	2026-02-09 10:58:54.963	2026-02-09 10:59:28.211	\N	\N	\N
5b939800-915f-4494-836c-08b950eac693	azwad@oitsdhaka.com	\N	USER_REGISTRATION	81f435d119aa6acd12e1680ba852b7f15c3c69d85926c50bbd670a6f20ed3490	ACCEPTED	2025-12-24 06:56:31.316	2025-12-23 06:56:57.067	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL"}	2025-12-23 06:56:31.317	2025-12-23 06:56:57.068	\N	\N	\N
880410de-7a5c-4fb5-9374-f69bd0b8b31f	azwadfawadhasan@gmail.com	\N	USER_REGISTRATION	944ef1ff783088824c693465eba16a1c8f710469962c889181b7ac11e382c029	ACCEPTED	2026-01-07 11:38:20.706	2026-01-06 11:39:35.775	\N	\N	\N	\N	\N	\N	\N	\N	\N	{"purpose": "VERIFY_EMAIL"}	2026-01-06 11:38:20.708	2026-01-06 11:39:35.777	\N	\N	\N
fe214f9c-76f5-4266-aa36-9f34402b51dd	azwad@oitsdhaka.com	\N	USER_REGISTRATION	6df4bfd7ed4962501413660070eee9a5ddad85a16e1c6d0c1379d383c9ed9984	ACCEPTED	2026-02-10 10:50:30.913	2026-02-09 10:55:50.835	\N	\N	\N	\N	\N	\N	256bffc9-58b3-4c08-a3d9-7b91a9f944ae	\N	\N	{"purpose": "VERIFY_EMAIL", "targetRole": "Vendor", "businessName": "Azwad_VENDOR"}	2026-02-09 10:50:30.915	2026-02-09 10:55:50.837	\N	\N	\N
\.


--
-- TOC entry 5603 (class 0 OID 52876)
-- Dependencies: 279
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, "invoiceId", "productId", quantity, "unitPrice", "totalPrice", description) FROM stdin;
\.


--
-- TOC entry 5581 (class 0 OID 52657)
-- Dependencies: 257
-- Data for Name: kyc_submissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kyc_submissions (id, "stakeholderId", "submissionDate", status, level, "reviewedById", "reviewedAt", "reviewNotes", "rejectionReason", "submittedDocs", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5606 (class 0 OID 52906)
-- Dependencies: 282
-- Data for Name: loyalty_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_transactions (id, "customerId", points, type, "referenceId", "referenceType", "expiresAt", status, description, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5552 (class 0 OID 52358)
-- Dependencies: 228
-- Data for Name: market_aisles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_aisles (id, "sectionId", "uniqueCode", "aisleNumber", name, "aisleType", "isCovered", "maxStallsPerSide", "fireExitAccess", "emergencyLighting", status, "lastCleaning", "lastMaintenance", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5554 (class 0 OID 52382)
-- Dependencies: 230
-- Data for Name: market_authorities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_authorities (id, "stakeholderId", "authorityName", "registrationNumber", jurisdiction, "contactPerson", "officeAddress", website) FROM stdin;
\.


--
-- TOC entry 5569 (class 0 OID 52525)
-- Dependencies: 245
-- Data for Name: market_gates; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_gates (id, "marketId", "uniqueCode", "gateNumber", "gateName", "gateType", location, "accessType", "allowedVehicleTypes", "hasScanner", "hasCamera", "hasSecurityCheck", "isOperational", "operatingHours", "assignedStaffId", "assignedCounterId", status, "lastMaintenance", "createdById", "createdAt", "updatedAt") FROM stdin;
07860bc7-d3c6-40d2-abaf-f05c67e7a423	d4f5e24b-fa83-4c7f-ae06-68f2f871e42c	TMKT91-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:52:55.662	2026-01-06 10:52:55.662
aabede04-d3a9-4dd9-83e1-7c2f52ea6138	25358889-3f55-4d37-9818-b7b701b50145	TMKT367-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:53:30.015	2026-01-06 10:53:30.015
622fd6ec-0a1b-4910-bcb1-7fe26048af6b	0e9f968d-efa8-4d56-ba60-83925ca05a36	TMKT237-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:54:20.206	2026-01-06 10:54:20.206
53a00e4f-988e-4c3e-bb02-d044c4e830d5	f7802092-93a1-4d79-aad0-35cb9274a758	TMKT708-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:56:38.654	2026-01-06 10:56:38.654
40d90c4e-7218-4a16-8c77-c7ff864d40d1	c99c3a8d-0452-475b-9506-b12c8bfccbf5	TMKT404-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:57:34.64	2026-01-06 10:57:34.64
57ed8909-54e9-4ba9-9baa-09a257bdb61a	00960b5d-6029-41d5-863b-4cf22049457e	TMKT663-G01	01	Main Gate	ENTRY	\N	ALL	["TRUCK"]	f	f	f	t	\N	\N	\N	ACTIVE	\N	9f093438-c651-46bb-9430-d10998940468	2026-01-06 10:58:32.869	2026-01-06 10:58:32.869
\.


--
-- TOC entry 5550 (class 0 OID 52322)
-- Dependencies: 226
-- Data for Name: market_levels; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_levels (id, "marketId", "levelNumber", "uniqueCode", name, description, "accessType", "hasElevator", "hasEscalator", "hasRestrooms", "hasParking", "totalSections", "totalShops", "totalStalls", "wheelchairAccess", "emergencyExits", status, "isOperational", "lastInspection", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5567 (class 0 OID 52511)
-- Dependencies: 243
-- Data for Name: market_masters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_masters (id, "adminId", "marketId") FROM stdin;
\.


--
-- TOC entry 5599 (class 0 OID 52838)
-- Dependencies: 275
-- Data for Name: market_regulations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_regulations (id, "marketId", "authorityId", title, description, "regulationNumber", "appliesTo", "effectiveDate", "enforcementDate", "complianceLevel", penalties, status, "isActive", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5551 (class 0 OID 52341)
-- Dependencies: 227
-- Data for Name: market_sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_sections (id, "marketId", "levelId", "uniqueCode", name, "displayName", description, "sectionType", "subType", "categoryTags", "locationCode", "entranceGate", "totalShops", "totalStalls", "occupiedShops", "occupiedStalls", "maxCapacity", "hasAirConditioning", "hasCommonLighting", "hasWaterSupply", "hasSecurityCamera", "supervisorId", "assistantIds", status, "openingTime", "closingTime", "createdById", "createdAt", "updatedAt", "sectionRules", "specialRequirements") FROM stdin;
\.


--
-- TOC entry 5591 (class 0 OID 52748)
-- Dependencies: 267
-- Data for Name: market_taxes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_taxes (id, "marketId", "taxType", name, description, rate, "calculationType", "appliesTo", "minAmount", "maxAmount", "isActive", "effectiveFrom", "effectiveUntil", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5570 (class 0 OID 52540)
-- Dependencies: 246
-- Data for Name: market_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.market_tokens (id, "tokenCode", "tokenType", "shortCode", "tokenValue", "displayValue", "marketId", "gateId", "stallId", "vendorId", "customerId", "adminId", "userId", "guestId", "vehicleNumber", "vehicleType", "driverName", "visitorName", "visitorType", "transactionId", amount, currency, purpose, description, metadata, "issuedAt", "validFrom", "expiresAt", "isSingleUse", "maxUses", "currentUses", status, "usedAt", "invalidatedAt", "invalidationReason", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5549 (class 0 OID 52302)
-- Dependencies: 225
-- Data for Name: markets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.markets (id, "cityId", name, "uniqueCode", "displayName", description, address, "marketType", categories, "totalLevels", "totalSections", "totalShops", "totalStalls", "occupiedShops", "occupiedStalls", "maxCapacity", "openingTime", "closingTime", "operatingDays", "is24Hours", "holidaySchedule", "contactPhone", "contactEmail", website, "managerName", "averageRent", "securityDeposit", "monthlyMaintenanceFee", status, "establishmentDate", "lastRenovation", notes, "createdByAdminId", "createdAt", "updatedAt") FROM stdin;
d4f5e24b-fa83-4c7f-ae06-68f2f871e42c	1613b2e2-087b-49b2-b963-af55d03e8199	Test Market 1767696771795	TMKT91	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:52:51.796	2026-01-06 10:52:51.796
25358889-3f55-4d37-9818-b7b701b50145	3b780aac-8a20-4fcd-9b7e-bd5454ebc65d	Test Market 1767696806237	TMKT367	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:53:26.239	2026-01-06 10:53:26.239
0e9f968d-efa8-4d56-ba60-83925ca05a36	617833fc-a2d6-47e4-810d-a330f25764d0	Test Market 1767696856464	TMKT237	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:54:16.465	2026-01-06 10:54:16.465
f7802092-93a1-4d79-aad0-35cb9274a758	982cc33b-77db-41ef-9743-70cbdf0a0008	Test Market 1767696994784	TMKT708	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:56:34.785	2026-01-06 10:56:34.785
c99c3a8d-0452-475b-9506-b12c8bfccbf5	88cb46ab-a19a-4277-bede-2cbf5ed03f37	Test Market 1767697050835	TMKT404	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:57:30.836	2026-01-06 10:57:30.836
00960b5d-6029-41d5-863b-4cf22049457e	fadfcd3b-2e28-419e-8675-6a91c7e18ea5	Test Market 1767697109006	TMKT663	\N	\N	123 Test St	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-01-06 10:58:29.008	2026-01-06 10:58:29.008
m1	c1	Nakasero Market	NAK-001	\N	\N	Nakasero, Kampala	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-02-06 11:55:26.656	2026-02-06 11:55:26.656
m2	c1	Owino Market	OWI-001	\N	\N	Downtown Kampala	PERMANENT	\N	1	0	0	0	0	0	\N	06:00	20:00	{MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY}	f	\N	\N	\N	\N	\N	\N	\N	\N	ACTIVE	\N	\N	\N	\N	2026-02-06 11:55:29.272	2026-02-06 11:55:29.272
\.


--
-- TOC entry 5555 (class 0 OID 52389)
-- Dependencies: 231
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, "stakeholderId", "membershipNumber", "membershipType", "membershipSince", "membershipExpiry", "businessName", "businessType", "registrationNumber", "taxIdNumber", "tradeLicenseNumber", "yearsInBusiness") FROM stdin;
\.


--
-- TOC entry 5564 (class 0 OID 52490)
-- Dependencies: 240
-- Data for Name: national_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.national_admins (id, "adminId", ministry, department, "officeLocation", jurisdiction, "taxAuthorityId") FROM stdin;
\.


--
-- TOC entry 5580 (class 0 OID 52646)
-- Dependencies: 256
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, "userId", type, title, message, priority, "isRead", "isArchived", "actionUrl", "actionLabel", data, "readAt", "archivedAt", "expiresAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5604 (class 0 OID 52883)
-- Dependencies: 280
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, "productId", "customerId", rating, title, comment, "isVerifiedPurchase", "purchaseDate", status, "isApproved", "helpfulVotes", "unhelpfulVotes", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5587 (class 0 OID 52712)
-- Dependencies: 263
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, "stallId", name, description, category, "subCategory", unit, price, "costPrice", "wholesalePrice", sku, barcode, "currentStock", "minStockLevel", "maxStockLevel", "isActive", "isApproved", "supplierId", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5568 (class 0 OID 52518)
-- Dependencies: 244
-- Data for Name: pseudo_market_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pseudo_market_admins (id, "adminId", "marketId", role, "assignedSection", specialization, "workingHours", permissions) FROM stdin;
\.


--
-- TOC entry 5572 (class 0 OID 52563)
-- Dependencies: 248
-- Data for Name: qr_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_codes (id, "qrCode", "qrType", "shortCode", "entityType", "entityId", "encodedData", "publicData", "encryptionKey", size, "errorCorrection", "foregroundColor", "backgroundColor", "logoUrl", "scanCount", "lastScanned", "firstScanned", "validFrom", "expiresAt", "isActive", "maxScans", "requireAuth", "allowedScanners", "createdById", "userId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5593 (class 0 OID 52773)
-- Dependencies: 269
-- Data for Name: qr_generation_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_generation_configs (id, "marketId", "qrType", name, description, size, "errorCorrection", "foregroundColor", "backgroundColor", "includeLogo", "logoUrl", "logoSize", "dataTemplate", "encryptionMethod", "expirationDays", "isActive", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5573 (class 0 OID 52579)
-- Dependencies: 249
-- Data for Name: qr_scan_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.qr_scan_logs (id, "qrCodeId", "scannerId", "scannedByUserId", "scannedByAdminId", "scannedAtGateId", "scannedAtCounterId", "deviceId", "deviceType", os, browser, "ipAddress", "gpsCoordinates", "isValid", "validationResult", "errorMessage", "responseData", "scannedAt") FROM stdin;
\.


--
-- TOC entry 5597 (class 0 OID 52817)
-- Dependencies: 273
-- Data for Name: rent_contracts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rent_contracts (id, "shopId", "landlordId", "tenantId", "startDate", "endDate", "durationMonths", "monthlyRent", "securityDeposit", "maintenanceFee", "paymentDay", status, "isActive", "terminationDate", "terminationReason", "contractNumber", "termsAndConditions", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5596 (class 0 OID 52806)
-- Dependencies: 272
-- Data for Name: rent_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rent_payments (id, "contractId", amount, "periodStart", "periodEnd", "dueDate", "paymentDate", "paymentMethod", "transactionId", "receiptNumber", "isLate", "lateFee", "gracePeriodDays", status, notes, "receivedById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5577 (class 0 OID 52616)
-- Dependencies: 253
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_permissions (id, "roleId", resource, action, conditions, "grantedById", "grantedAt", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5575 (class 0 OID 52597)
-- Dependencies: 251
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, description, level, "isSystem", permissions, metadata, "createdAt", "updatedAt") FROM stdin;
59426bdf-50ca-4d14-a86d-60a951dec366	Guest	New registered user	\N	f	\N	\N	2026-02-06 11:49:54.033	2026-02-06 11:49:54.033
f8d2aa01-be36-4b86-8b0d-7360412103ba	Vendor	Market vendor / shop owner	\N	f	\N	\N	2026-02-06 11:49:58.502	2026-02-06 11:49:58.502
7bffcf99-e048-47d0-9a5a-256c511c1dee	Supplier	Goods supplier	\N	f	\N	\N	2026-02-06 11:50:00.093	2026-02-06 11:50:00.093
894ae145-2c3d-4dab-a64c-9f0ddcdff981	SuperAdmin	System-wide administrator	SUPER_ADMIN	f	\N	\N	2026-02-06 11:49:57.217	2026-02-06 11:55:33.529
8314a7f1-6439-4ea0-b6fa-acdc8ef2f59d	MarketMaster	Manages a specific market	MARKET_MASTER	f	\N	\N	2026-02-06 11:49:57.862	2026-02-06 11:55:34.167
2b13c906-d1a8-4f5e-bb31-d8f7c2c8c9c9	GateCounter	Gate entry/exit management	PSEUDO_MARKET_ADMIN	f	\N	\N	2026-02-06 11:49:58.183	2026-02-06 11:55:34.809
\.


--
-- TOC entry 5586 (class 0 OID 52705)
-- Dependencies: 262
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, "saleId", "productId", quantity, "unitPrice", "totalPrice", discount) FROM stdin;
\.


--
-- TOC entry 5585 (class 0 OID 52695)
-- Dependencies: 261
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, "stallId", "customerId", "totalAmount", "taxAmount", "discountAmount", "netAmount", "paymentMethod", "paymentStatus", "transactionId", "saleDate", notes, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5594 (class 0 OID 52788)
-- Dependencies: 270
-- Data for Name: scanner_devices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scanner_devices (id, "deviceId", "marketId", "gateId", name, "deviceType", manufacturer, model, "serialNumber", "firmwareVersion", "ipAddress", "macAddress", "isActive", "lastSeen", "batteryLevel", metadata, "registeredById", "registeredAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5609 (class 0 OID 52932)
-- Dependencies: 285
-- Data for Name: shop_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shop_assets (id, "shopId", "assetType", "assetUrl", "fileName", "fileSize", "mimeType", description, tags, "isActive", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5560 (class 0 OID 52436)
-- Dependencies: 236
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shops (id, "marketId", "levelId", "sectionId", "memberId", "uniqueCode", "shopNumber", "displayName", "shopName", "shopType", "subType", "categoryTags", "locationDescription", "accessPoints", "hasElectricity", "hasWaterSupply", "hasStorage", "hasAirConditioning", "hasDisplayWindow", "hasSecurityShutter", "electricityMeterNumber", "waterMeterNumber", "internetConnection", "monthlyRent", "securityDeposit", "maintenanceFee", "electricityRate", "waterRate", "contractStartDate", "contractEndDate", "paymentDay", "gracePeriodDays", status, "occupationStatus", "lastRenovation", "inspectionDueDate", "inventoryValue", "createdById", "marketMasterId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5553 (class 0 OID 52371)
-- Dependencies: 229
-- Data for Name: stakeholders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stakeholders (id, "userId", "stakeholderType", "kycStatus", "kycSubmittedAt", "kycVerifiedAt", "kycVerifiedByAdminId", "kycDocuments", "bankAccountDetails", "taxComplianceStatus", "businessRating", notes, "createdAt", "updatedAt") FROM stdin;
331e49be-928b-4b48-a82f-b1ebbe4ff212	044a55f5-137a-4602-b406-1d0d7c1b7a3b	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:52:56.971	2026-01-06 10:52:56.971
b399f38a-221b-4a77-b3fc-e07e18389776	c5d478b8-71af-4aee-92c4-926a413e4bb8	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:53:31.278	2026-01-06 10:53:31.278
eeaf1ced-fa6a-4243-a49c-f2d1769f2907	fa046215-4643-46d4-885c-11263036896e	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:54:21.451	2026-01-06 10:54:21.451
8876b821-1f60-46f6-b40c-31f261708397	f2f32470-0a07-4fcc-a1ec-af0cfcb2afcb	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:56:39.947	2026-01-06 10:56:39.947
b2e9796e-ae15-4882-9d60-f9140f5fb986	bca12b16-1bcb-4616-8ea1-a92baf135371	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:57:35.911	2026-01-06 10:57:35.911
2b7cc73b-578c-423e-8307-61b777962b8d	4ee01195-317a-4f90-bda7-6cec07cd5095	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-06 10:58:34.157	2026-01-06 10:58:34.157
7f91c723-8169-48e3-a906-a9f4baf71f10	b9adab58-6828-4f90-9256-71423b9ad32e	VENDOR	VERIFIED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-01-21 07:51:25.282	2026-01-21 07:51:25.282
75110206-b8d7-489b-8f02-fdc5ea9f765b	b891627e-d478-4ca1-930c-fab0143f1dd4	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-06 11:39:00.624	2026-02-06 11:39:00.624
2ede33e3-3ca5-42c6-bfd9-93d6e27a5a52	6dc32546-187a-45bc-9950-c08bc31fcd18	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-06 11:58:10.722	2026-02-06 11:58:10.722
c19e535f-2e63-4a57-853f-0524eb0ee0fd	d37c0d8e-7088-4adc-b719-d0f16b945136	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-06 12:08:45.684	2026-02-06 12:08:45.684
d0301b48-b95a-4c8a-8db0-a0051b0e35c4	3d047462-1f81-4de1-aa30-0487351c5ec3	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-06 12:13:50.984	2026-02-06 12:13:50.984
a1166763-13fc-44ca-8ac8-99535708a89a	51ba7bb0-41e6-4154-a4d4-68c2e1137230	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-09 10:15:05.667	2026-02-09 10:15:05.667
ce66560c-a0ad-4425-89b2-523fec3ab4c0	5945de9f-9e1e-4335-9627-af79080ee48b	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-09 10:30:19.747	2026-02-09 10:30:19.747
1840860a-bf57-46c5-88f2-62d54fd6e0ed	256bffc9-58b3-4c08-a3d9-7b91a9f944ae	VENDOR	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-09 10:55:53.369	2026-02-09 10:55:53.369
7b9c8fac-ad67-464f-bfe3-c5c4640d9c6c	e3cbfe58-c3e9-4335-9b30-88af8689f296	SUPPLIER	NOT_SUBMITTED	\N	\N	\N	\N	\N	COMPLIANT	5	\N	2026-02-09 10:59:30.442	2026-02-09 10:59:30.442
\.


--
-- TOC entry 5610 (class 0 OID 52941)
-- Dependencies: 286
-- Data for Name: stall_assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stall_assets (id, "stallId", "assetType", "assetUrl", "fileName", "fileSize", "mimeType", description, tags, "isActive", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5561 (class 0 OID 52456)
-- Dependencies: 237
-- Data for Name: stalls; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stalls (id, "shopId", "vendorId", "sectionId", "aisleId", "levelId", "uniqueCode", "stallNumber", "displayName", "stallType", category, "subCategories", specialization, "hasDisplayCounter", "hasStorage", "hasLighting", "hasPowerOutlet", "hasCashRegister", "dailyRate", "monthlyRate", "securityDeposit", "billingCycle", "contractStartDate", "contractEndDate", "agreementTerms", "openingTime", "closingTime", "operatingDays", status, "operationalStatus", "lastStockCheck", "lastCleaning", "visitCount", "qrCode", "createdById", "marketMasterId", "marketId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5589 (class 0 OID 52731)
-- Dependencies: 265
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, "marketId", "stallId", "movementType", quantity, unit, "productName", "productCategory", "vehicleNumber", "vehicleType", "driverName", "inspectedById", "inspectionNotes", "inspectionStatus", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5563 (class 0 OID 52483)
-- Dependencies: 239
-- Data for Name: super_admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.super_admins (id, "adminId", "globalSettings", "systemAccessLogs", "apiKeys", "backupSettings") FROM stdin;
74975b4c-fbcc-4b15-825a-10ba1567b60d	939d2d2f-5739-4b0e-b803-a6c851f3f34f	\N	\N	\N	\N
c81fcba7-889b-44c2-8c25-841517e7b9e8	05c76a46-8675-49dd-baea-6f84d4e5a3dd	\N	\N	\N	\N
e0c16eb8-eef7-4a37-b9d4-022b5435f875	00b42b9f-f638-40a7-bb52-f8af9d74b8bf	\N	\N	\N	\N
16421e0e-4067-49d1-9a59-ef90cd182781	0e258428-ce59-448f-ba57-bc11b0cf7e4e	\N	\N	\N	\N
\.


--
-- TOC entry 5602 (class 0 OID 52865)
-- Dependencies: 278
-- Data for Name: supplier_invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.supplier_invoices (id, "supplierId", "stallId", "invoiceNumber", "invoiceDate", "dueDate", subtotal, "taxAmount", "totalAmount", "amountPaid", "amountDue", "paymentStatus", "paymentDate", "paymentMethod", status, notes, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5557 (class 0 OID 52406)
-- Dependencies: 233
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suppliers (id, "stakeholderId", "supplierCode", "businessName", "supplierType", "licenseNumber", "taxId", "warehouseAddress", "deliveryRadius", "minimumOrder", "paymentTerms") FROM stdin;
a9b786b7-fc3c-49fc-8b26-bddc95df34de	331e49be-928b-4b48-a82f-b1ebbe4ff212	SUP_1767696777627	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
9c251ae6-27d9-424b-a9d5-f3e731cd69f0	b399f38a-221b-4a77-b3fc-e07e18389776	SUP_1767696811907	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
d23c1281-ea09-4c6b-b896-a9cceaa07cff	eeaf1ced-fa6a-4243-a49c-f2d1769f2907	SUP_1767696862075	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
0b14daf3-b601-455d-aa69-b3ab2622beee	8876b821-1f60-46f6-b40c-31f261708397	SUP_1767697000591	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
f9da99a2-2ca0-4d9c-ba77-b62a2c8dbe2b	b2e9796e-ae15-4882-9d60-f9140f5fb986	SUP_1767697056542	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
fb9a2075-36ce-416a-a9e2-ca6c9e91c59c	2b7cc73b-578c-423e-8307-61b777962b8d	SUP_1767697114798	Test Supplier Inc	WHOLESALER	\N	\N	\N	\N	\N	NET30
b787539a-aebb-425e-a5e4-ec89c59d59ee	7b9c8fac-ad67-464f-bfe3-c5c4640d9c6c	SUP-D5E1B4A2	azwad_supplier	WHOLESALER	\N	\N	\N	\N	\N	NET30
\.


--
-- TOC entry 5590 (class 0 OID 52739)
-- Dependencies: 266
-- Data for Name: tax_payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tax_payments (id, "marketId", "vendorId", "taxType", amount, "periodStart", "periodEnd", "dueDate", "paymentDate", "paymentMethod", "transactionId", "receiptNumber", "collectedById", "collectionNotes", status, metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5592 (class 0 OID 52759)
-- Dependencies: 268
-- Data for Name: token_generation_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.token_generation_configs (id, "marketId", "tokenType", name, description, prefix, suffix, length, charset, "expirationHours", "isSingleUse", "maxUses", "requireValidation", "validationRules", "isActive", metadata, "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5571 (class 0 OID 52555)
-- Dependencies: 247
-- Data for Name: token_usage_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.token_usage_logs (id, "tokenId", action, "usedByUserId", "usedByAdminId", "usedAtGateId", "usedAtCounterId", "deviceId", "deviceType", "scannerId", "ipAddress", "gpsCoordinates", "isValid", "validationMessage", metadata, "createdAt") FROM stdin;
\.


--
-- TOC entry 5584 (class 0 OID 52685)
-- Dependencies: 260
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transactions (id, "stakeholderId", type, amount, currency, status, "referenceId", "externalReference", "paymentMethod", "paymentGateway", "gatewayResponse", metadata, "createdAt", "updatedAt") FROM stdin;
\.


--
-- TOC entry 5543 (class 0 OID 52231)
-- Dependencies: 219
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, "userId", title, "firstName", "middleName", "lastName", "displayName", gender, "dateOfBirth", age, "nationalId", "nationalIdType", "passportNumber", "passportCountry", "taxIdNumber", "primaryPhone", "secondaryPhone", "emergencyPhone", "emergencyContact", "primaryEmail", "secondaryEmail", "residentialAddress", "permanentAddress", city, district, country, "postalCode", occupation, "companyName", designation, "yearsOfExperience", "maritalStatus", "spouseName", religion, language, "profilePictureUrl", "signatureUrl", "preferredLanguage", timezone, currency, "notificationPreferences", "verificationLevel", "verifiedByAdminId", "verificationDate", "personalQRCode", "qrCodeExpiry", "bankName", "bankAccountNumber", "bankAccountName", metadata, version, "createdAt", "updatedAt", "lastProfileUpdate") FROM stdin;
ad897693-c10a-445b-8046-0533230535a2	6dc32546-187a-45bc-9950-c08bc31fcd18	\N	abcd	\N	abcd	\N	\N	\N	\N	\N	NIN	\N	\N	\N	1234	\N	\N	\N	abcd@qwerty.com	\N	\N	\N	\N	\N	Uganda	\N	\N	\N	\N	\N	\N	\N	\N	{en,sw}	\N	\N	en	Africa/Kampala	UGX	\N	BASIC	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-02-06 11:58:08.623	2026-02-06 11:58:08.623	\N
3fe500f1-fc59-4151-ac1a-dc57d1c9d150	d37c0d8e-7088-4adc-b719-d0f16b945136	\N	Vendor	\N	Testin	\N	\N	\N	\N	\N	NIN	\N	\N	\N	+8801711531854	\N	\N	\N	root@gmail.com	\N	\N	\N	\N	\N	Uganda	\N	\N	\N	\N	\N	\N	\N	\N	{en,sw}	\N	\N	en	Africa/Kampala	UGX	\N	BASIC	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-02-06 12:08:43.153	2026-02-06 12:08:43.153	\N
3fe5ebd6-c49f-4549-81be-7976d0fbe278	3d047462-1f81-4de1-aa30-0487351c5ec3	\N	Jack	\N	Smith	\N	\N	\N	\N	\N	NIN	\N	\N	\N	+8801711531953	\N	\N	\N	jacksmithstore@gmail.com	\N	\N	\N	\N	\N	Uganda	\N	\N	\N	\N	\N	\N	\N	\N	{en,sw}	\N	\N	en	Africa/Kampala	UGX	\N	BASIC	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-02-06 12:13:48.482	2026-02-06 12:13:48.482	\N
149c8910-3b36-4ba3-88a7-c4e5e16d6844	51ba7bb0-41e6-4154-a4d4-68c2e1137230	\N	nav	\N	navbar	\N	\N	\N	\N	\N	NIN	\N	\N	\N	123124555	\N	\N	\N	nav@gmail.com	\N	\N	\N	\N	\N	Uganda	\N	\N	\N	\N	\N	\N	\N	\N	{en,sw}	\N	\N	en	Africa/Kampala	UGX	\N	BASIC	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-02-09 10:15:03.155	2026-02-09 10:15:03.155	\N
d2fdc599-7e49-4109-8ab4-4dfc03120f3b	5945de9f-9e1e-4335-9627-af79080ee48b	\N	John	\N	Doe	\N	\N	\N	\N	\N	NIN	\N	\N	\N	+2562562536	\N	\N	\N	vendor_email2@example.com	\N	\N	\N	\N	\N	Uganda	\N	\N	\N	\N	\N	\N	\N	\N	{en,sw}	\N	\N	en	Africa/Kampala	UGX	\N	BASIC	\N	\N	\N	\N	\N	\N	\N	\N	1	2026-02-09 10:30:18.427	2026-02-09 10:30:18.427	\N
\.


--
-- TOC entry 5576 (class 0 OID 52606)
-- Dependencies: 252
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_roles (id, "userId", "roleId", "assignedById", "assignedAt", "expiresAt", "isActive", metadata, "createdAt", "updatedAt") FROM stdin;
ca12fa5f-f790-4f2b-82af-890abccbdd99	9f093438-c651-46bb-9430-d10998940468	894ae145-2c3d-4dab-a64c-9f0ddcdff981	\N	2026-02-06 11:55:38.427	\N	t	\N	2026-02-06 11:55:38.427	2026-02-06 11:55:38.427
f33bcf3f-e2ca-4142-bc07-5a9e908fc607	7f283c4c-82a9-4332-a239-cd218f9fd727	894ae145-2c3d-4dab-a64c-9f0ddcdff981	\N	2026-02-06 11:55:42.977	\N	t	\N	2026-02-06 11:55:42.977	2026-02-06 11:55:42.977
278bca9d-446b-4e4d-b7cc-50ae17c8d268	7321cbc2-60ea-4308-a263-2d166a89f940	8314a7f1-6439-4ea0-b6fa-acdc8ef2f59d	\N	2026-02-06 11:55:45.601	\N	t	\N	2026-02-06 11:55:45.601	2026-02-06 11:55:45.601
2b00a103-900b-46a5-9f11-9cd8cdd01f7e	af6ff0c9-ca99-4f42-abe3-6189880de319	2b13c906-d1a8-4f5e-bb31-d8f7c2c8c9c9	\N	2026-02-06 11:55:48.218	\N	t	\N	2026-02-06 11:55:48.218	2026-02-06 11:55:48.218
8ef03efd-d52c-4f2e-bd18-45e06141554d	6dc32546-187a-45bc-9950-c08bc31fcd18	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-06 11:58:08.623	\N	t	\N	2026-02-06 11:58:08.623	2026-02-06 11:58:08.623
aed32dbc-5a36-4089-b42b-6bfa2e0fd643	d37c0d8e-7088-4adc-b719-d0f16b945136	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-06 12:08:43.153	\N	t	\N	2026-02-06 12:08:43.153	2026-02-06 12:08:43.153
26339b99-0763-4082-8e95-466dbfd410a4	3d047462-1f81-4de1-aa30-0487351c5ec3	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-06 12:13:48.482	\N	t	\N	2026-02-06 12:13:48.482	2026-02-06 12:13:48.482
08f14212-dfc3-4e64-ad8f-ad933858641c	51ba7bb0-41e6-4154-a4d4-68c2e1137230	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-09 10:15:03.155	\N	t	\N	2026-02-09 10:15:03.155	2026-02-09 10:15:03.155
ee645ac4-24d5-4423-aa35-e92cac6433c1	5945de9f-9e1e-4335-9627-af79080ee48b	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-09 10:30:18.427	\N	t	\N	2026-02-09 10:30:18.427	2026-02-09 10:30:18.427
8eca5581-b95d-4cc9-9a2b-e200fc8ef080	256bffc9-58b3-4c08-a3d9-7b91a9f944ae	f8d2aa01-be36-4b86-8b0d-7360412103ba	\N	2026-02-09 10:55:52.736	\N	t	\N	2026-02-09 10:55:52.736	2026-02-09 10:55:52.736
89fd636d-60ca-43eb-9450-32b06f478e2b	e3cbfe58-c3e9-4335-9b30-88af8689f296	7bffcf99-e048-47d0-9a5a-256c511c1dee	\N	2026-02-09 10:59:29.801	\N	t	\N	2026-02-09 10:59:29.801	2026-02-09 10:59:29.801
\.


--
-- TOC entry 5545 (class 0 OID 52258)
-- Dependencies: 221
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, "userId", "sessionToken", "refreshToken", "deviceId", "deviceName", "deviceType", os, browser, "ipAddress", city, country, coordinates, "mfaVerified", "lastActivity", "expiresAt", "isActive", "logoutReason", "createdAt", "loggedOutAt") FROM stdin;
0234e503-532b-4af9-afa4-9e365880181f	256bffc9-58b3-4c08-a3d9-7b91a9f944ae	61f0f1cbd1718355b948bf95847836c90dc1c7d827b44c346e4aec1848dd0af4	843ac41bc637683c4bf0a28d982bdfb638ecd347b902cc140ceae5e4d0b0f6b8	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:55:56.207	2026-02-16 10:55:56.206	t	\N	2026-02-09 10:55:56.207	\N
fdff4936-60c4-4255-b80d-86d29ade8d77	7321cbc2-60ea-4308-a263-2d166a89f940	5ad34feaaf2fec5c86229b130345ba0021f6ae24ac5a1c334e566c16b4a98d4e	d3bac11044938f997b6793f751ff290cb3fd67dc52b3121244836ccfb8f56355	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-06 10:57:41.374	2026-01-13 10:57:41.37	t	\N	2026-01-06 10:57:41.374	\N
1df495f1-212a-475f-ac2c-cdc9a8363446	7321cbc2-60ea-4308-a263-2d166a89f940	0590ddc24f15b5ea926d03cbb1c8f7979e41b396143708915e01dc58ae718120	ee5f8137a943d9488b165523e454f5128e033c3a806dcd1a81f192a136b133fb	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-06 10:58:39.766	2026-01-13 10:58:39.763	t	\N	2026-01-06 10:58:39.766	\N
337eed7b-862f-4e19-8921-1706fe36042a	256bffc9-58b3-4c08-a3d9-7b91a9f944ae	571a3458bb0fe08590d60ccadb5105a87a331fef6978f25308a46bf83c956ecf	63ae33896eff0a2d51c1e0683b904d90cd651f8901a7d9665d6f373a96bb8298	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:57:05.355	2026-02-16 10:57:05.353	t	\N	2026-02-09 10:57:05.355	\N
bdbe03ed-64a5-4a64-93b4-c27d051c316a	e3cbfe58-c3e9-4335-9b30-88af8689f296	8bee3b0aa90c63e8e9ce1af3654d81ecb20b602840c67b727ef77a5270246cc4	982f1c515d1bbbc71fc9929c534ae3fe98d7c08e1e48675739dfa24e008f5721	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:59:33.328	2026-02-16 10:59:33.326	t	\N	2026-02-09 10:59:33.328	\N
2e99a9b7-c039-4478-af77-7ef6ff5b665b	34469dbb-5d1d-42a8-85c1-33ea569eb667	5c0d0b4768d69d2b10f8a720aee9264fc4e71ada2f000304f31ed84946fbcf14	e58fb2f98da7621ec1ba2ffb22cad81b1ac630632fadb39accd132f1e6a80f76	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-21 07:51:10.744	2026-01-28 07:51:10.743	t	\N	2026-01-21 07:51:10.744	\N
6a2ecc49-cfbf-4d6a-a3bd-b42bee1fbcbb	b9adab58-6828-4f90-9256-71423b9ad32e	8fc0df1dd3c816291f3cc9c6d71c95c00c88337e68db8292258531f2c396a0a5	071e0231017b6cc78c4e912ad4b81d5c9e8745b1d9da175392cadb1cdbaa8dc5	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-21 07:51:28.148	2026-01-28 07:51:28.146	t	\N	2026-01-21 07:51:28.148	\N
525576c8-206f-4ac7-b63f-443dec62f6ad	e3cbfe58-c3e9-4335-9b30-88af8689f296	98288c7209d075407f6535eb3993c0f020778f87f0d1ba13f4ee8248fbb77ee3	82c62ee64840442b3e1691671c08fe371895d3df2ab6d21372146d9bebc805f4	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:59:52.347	2026-02-16 10:59:52.346	t	\N	2026-02-09 10:59:52.347	\N
11e83831-b7e1-4c75-beb5-9a3ccaa5c512	9f093438-c651-46bb-9430-d10998940468	e8ecb4d165caadafcbedb6a05a10f586f254e874d37f78a855bc78fdcb8eec3d	e5daafd79165e5066c32838a4e063281ab9a1e9d6d5fb805eebdae65154f307a	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 08:42:35.683	2026-02-04 08:42:35.682	t	\N	2026-01-28 08:42:35.683	\N
2c92dd29-9145-4ba7-a4de-4e7291bdab65	adb5cc70-a1a1-4b3a-a628-c07910a7113e	5e3ac7c4a83fa41f85bb351a5b9a9a1f690abe01a4798eb086e560060b1671ac	a0f7c1037727da0bbef0cb8c41aef2bccca2244468dccf94a183988de1644501	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 08:46:10.635	2026-02-04 08:46:10.634	t	\N	2026-01-28 08:46:10.635	\N
dd99360d-14c1-4065-8985-846abd38a40e	7f283c4c-82a9-4332-a239-cd218f9fd727	03cebadc033a31cd686a8b6f720215205456e452490a23195994328eb47e62c7	39327b3bd19b802c399c5ddda0a2ee6c2f5af98d9831229a7ab5491278a39b7c	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 09:04:00.818	2026-02-04 09:04:00.816	t	\N	2026-01-28 09:04:00.818	\N
a8bbadab-1beb-4e47-b088-6792c54b26ec	7f283c4c-82a9-4332-a239-cd218f9fd727	67f1577cf2dcd5104b401b9eae03514dd53ede627d549bcb6394728413eb04bd	e26d4c86625986bb5ad1f74ededd21e584d97761eeb2369926151d58fdd335c7	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 09:04:54.554	2026-02-04 09:04:54.553	t	\N	2026-01-28 09:04:54.554	\N
8a051b8c-473c-4d7b-923f-92ae25437b45	7f283c4c-82a9-4332-a239-cd218f9fd727	665b97f33f3501661751d98982b26ef4250dff473487dc4ca83938181976479b	63c2895e56b091f250ca75a69854405b1a22db05d6951ef2ea18196d27a59d35	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 09:06:56.924	2026-02-04 09:06:56.922	t	\N	2026-01-28 09:06:56.924	\N
02119058-a6a0-4c1a-83f1-166fb2ba7870	7f283c4c-82a9-4332-a239-cd218f9fd727	3705d751e9fc822023476d8327b484f98a3afa25dbba9f21434b3e621fd073e5	ebda73dc58ecddc0566a9cab510156b7d15fbd7c0b8cd9331e5e04f1a96b55b9	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 10:02:38.894	2026-02-04 10:02:38.891	t	\N	2026-01-28 10:02:38.894	\N
a2566a62-7dd7-47a6-b770-cc1245d1ac09	7f283c4c-82a9-4332-a239-cd218f9fd727	b559589b46a44f68b9243d039eb2631044d556cd7ff7fc5ac731fca1463d38b4	a7909f3417cef3a8adeacf8b2fe70bab66e0da5ca653d797ce09190a914cbcf2	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-01-28 10:27:22.956	2026-02-04 10:27:22.954	t	\N	2026-01-28 10:27:22.956	\N
44d358fb-fe76-4f13-b415-32683e3de816	7f283c4c-82a9-4332-a239-cd218f9fd727	c8b6d5708c70075ea39897c9d61814166fdeafb77ec0b35e6632e981bcb11c4c	981b2b6fb2b69527467bf69365b27bfe8c220c9fcbd0b3a944d0fc23b68f2820	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 10:47:28.509	2026-02-13 10:47:28.507	t	\N	2026-02-06 10:47:28.509	\N
c202d6c0-8103-4044-8230-76a8b20cb0a9	7f283c4c-82a9-4332-a239-cd218f9fd727	50d3ca1f27e1cc016883e555b2841d18bb78e9596c196bb53cd815c1063e4ed7	9079f43a4ba6d56860e4bed1957d3dd2cfa4b413ac61649943a07d3a49bf9a15	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 10:51:54.067	2026-02-13 10:51:54.066	t	\N	2026-02-06 10:51:54.067	\N
89585b49-7f21-42a0-a3af-ae5ebc84c070	7f283c4c-82a9-4332-a239-cd218f9fd727	776486ff555c2beaf8c940407bec1f197eea66fd98a6f1fc505da695993fffa1	b216d79927a2729bc76193b530a7ca9f6a5e4e5b6fb342694aa52fe1a4c4aded	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:02:18.939	2026-02-13 11:02:18.938	t	\N	2026-02-06 11:02:18.939	\N
5da2c425-3cbb-43bc-88e0-4f21b93ab6d1	7f283c4c-82a9-4332-a239-cd218f9fd727	08c52fcc5c6d304c6cfe664536f0199dac00aae6fa696fa8430df6c829648441	0fd18ed786bff0a493d83cd5e73a253ff79c260ece696e24495cd57e523c6cbe	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:25:46.362	2026-02-13 11:25:46.361	t	\N	2026-02-06 11:25:46.362	\N
89221515-ecb9-4c6d-b648-8e2c31a1198f	7f283c4c-82a9-4332-a239-cd218f9fd727	26df37549689a9f81e36e5b30b8c644c145054bb5472c3efe94eb0acb7d548b3	a1e7d620486261570a0e110fedebe41351bcaa1736fa70b5a01713679974dbdc	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:41:28.037	2026-02-13 11:41:28.036	t	\N	2026-02-06 11:41:28.037	\N
53f5d5cd-6908-4f73-99f6-d53890b0db9a	7f283c4c-82a9-4332-a239-cd218f9fd727	46cf9523bf9901b10d8b1fb134dfb7d8048f36f44603b8bb36a1e33219618843	b7c559b8a128d68c2607d2856c6ea42295a6eb38b0bd2bf0a4a62e35624cc3d5	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:44:06.924	2026-02-13 11:44:06.923	t	\N	2026-02-06 11:44:06.924	\N
e2b85e3e-4e3d-4bcb-8dc5-23fcba4f240e	9f093438-c651-46bb-9430-d10998940468	9b18692912a87870c1062a96bd181cd98da9ee76a12b9dcf7e3b9de7be49d334	0b49af13a1bd3aa625ce16ddc2200de266ca0409602ba923b209551ae733070c	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:45:33.422	2026-02-13 11:45:33.421	t	\N	2026-02-06 11:45:33.422	\N
b319ee45-1e35-463b-b7c0-dddb661c1567	7f283c4c-82a9-4332-a239-cd218f9fd727	9e5c03d4e918031eeaaceb8d58ad58072d09ebc21f640d5033f423a7df303942	f49b836eff801b85fa354bbdccb85494751b890683a4307d48856712cdbcea20	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:45:55.191	2026-02-13 11:45:55.19	t	\N	2026-02-06 11:45:55.191	\N
85cd9175-9e99-4594-adbc-f30f6916cb4b	7f283c4c-82a9-4332-a239-cd218f9fd727	d08983e15e152fcadd489d40e2b7e4b135def31c90d01170c9c2f1fbb7eb3078	811166ff8ddd58e53f1ed82f061fd2ef19bd084408da8eed8820879dda36e475	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:46:10.015	2026-02-13 11:46:10.013	t	\N	2026-02-06 11:46:10.015	\N
7ac21efd-cbe7-4a38-814b-d4dbb6f33400	7f283c4c-82a9-4332-a239-cd218f9fd727	285167e84342ef9ed950cf53916f3f54c4cf2a4cec4e6bcb2f4744e8d653c4b7	29c50db01849469231f619642ece37928bbda7582de49f9af57197e6c944b90b	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 11:50:55.303	2026-02-13 11:50:55.301	t	\N	2026-02-06 11:50:55.303	\N
ea867abc-f104-4212-b5c5-a32e6e0719ab	7f283c4c-82a9-4332-a239-cd218f9fd727	44c2afa8e30fdc7c3c17bf15bb9b25993a7cdf2fabd2e86b6329ff9a955610cb	b13930b55b08ed59033dbb3bd406ab7aa4499b0067e1c2ea63b11ddb95dc187c	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 12:08:01.705	2026-02-13 12:08:01.704	t	\N	2026-02-06 12:08:01.705	\N
eef4d796-d771-4f7a-a044-bfcb482ce10a	7f283c4c-82a9-4332-a239-cd218f9fd727	80393e0f2cb07ef2c188b95a24164a1aa03aa76435b50c1b36cf02ddba5c4886	80aeb17a09f8e92e010de5d4f1f8dcbaa7e69338e623c0ec798634234851cb64	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-06 12:12:49.207	2026-02-13 12:12:49.205	t	\N	2026-02-06 12:12:49.207	\N
e622a63d-f4dd-44b8-8d36-df1b10e337d7	7f283c4c-82a9-4332-a239-cd218f9fd727	59813c62ed26584e053795ef40cbe76620a12c63cee178f82c45ebabb90e54a0	4b829f96dfc73fc14ad721d673ef893b66ac2c6315d815514e91a6f772e458b8	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:13:23.261	2026-02-16 10:13:23.257	t	\N	2026-02-09 10:13:23.261	\N
1d6435f3-1e9a-4d68-addb-7c53965e9a50	7f283c4c-82a9-4332-a239-cd218f9fd727	15954bed00836699c2800d72a669270a10d0c7f5e483b36efaf8f3017f43bd33	ff297c908ef6238ce8cce45f7ec4f0a77c63f37c1fb0df2bfa562597f7615689	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:22:41.24	2026-02-16 10:22:41.239	t	\N	2026-02-09 10:22:41.24	\N
43afdbe8-c10b-4cc6-bdb8-ad6f15bc2cba	7f283c4c-82a9-4332-a239-cd218f9fd727	fd97f42c5eca5883812054bd61317a178dc510903cbf21281521a4fedbf09123	b7c4dda6150e56c537705407a5d019ac552e947f78bf3e37b1ba895aa21ee8f6	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:24:21.232	2026-02-16 10:24:21.231	t	\N	2026-02-09 10:24:21.232	\N
ed7161f5-6396-4aaf-af28-80c0f3e4500d	7f283c4c-82a9-4332-a239-cd218f9fd727	3c3b42ce38e478ddac921a52e820f53571fd90cf2694b8d241a734559f789100	f2d3dc499828b924a498c2fef37042d47d1630ed49993b1a4c200d110168e649	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:40:33.222	2026-02-16 10:40:33.221	t	\N	2026-02-09 10:40:33.222	\N
bb2dc01c-4070-476d-bd03-2022d33312af	7f283c4c-82a9-4332-a239-cd218f9fd727	39133c26685192dde12e52a2ce97fd745450515c2d6ebb2bb69315dd5809aab0	72690dae26b3baae9628b3adbf885717676d90c533dfc5ac5465a4d9b2d867e7	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:41:06.054	2026-02-16 10:41:06.053	t	\N	2026-02-09 10:41:06.054	\N
0fafe306-2d20-404d-96c5-81794e22580e	7f283c4c-82a9-4332-a239-cd218f9fd727	b6f47aaec3700798871607a7a133e3000e0887b9959a454ffc46d81a6158c685	c6ad2bb72d73140e5d6babaf13d764a2a05f77814b7c30cebc50737b5c3acd48	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	2026-02-09 10:45:53.646	2026-02-16 10:45:53.645	t	\N	2026-02-09 10:45:53.646	\N
\.


--
-- TOC entry 5542 (class 0 OID 52217)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, "passwordHash", phone, "mfaEnabled", "mfaType", "totpSecret", "totpBackupCodes", "lastTotpUsed", "emailVerified", "phoneVerified", "lastEmailVerificationSent", "lastPhoneVerificationSent", "loginAttempts", "lockUntil", "lastLogin", "lastPasswordChange", "passwordHistory", status, "deactivationReason", "createdAt", "updatedAt", "deletedAt") FROM stdin;
b891627e-d478-4ca1-930c-fab0143f1dd4	test_vendor_1770377934356@example.com	$2a$10$e6lTg4J9TK1a1rEE8IF.3u9IGxvK7e5zEQv55yi67c7FwxQ51Q3L.	123456789	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	DELETED	\N	2026-02-06 11:38:58.108	2026-02-06 11:39:06.003	2026-02-06 11:39:06.001
51ba7bb0-41e6-4154-a4d4-68c2e1137230	nav@gmail.com	$2a$10$vfL0WIbMCRcAi.nr4feRaOXVwOdVlGLot/FcVdo53VdqzSYgfj0Ry	123124555	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-02-09 10:15:03.155	2026-02-09 10:15:03.155	\N
9f093438-c651-46bb-9430-d10998940468	superadmin@marketmaster.com	$2a$10$9wCd2B1oh1ZR7eb5iSBeL.6bbDsnDFE.01PYZlrl9TgjYVj7bS4Rm	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	2026-02-06 11:45:33.735	\N	\N	ACTIVE	\N	2025-12-04 12:31:18.485	2026-02-06 11:55:38.427	\N
7321cbc2-60ea-4308-a263-2d166a89f940	manager@marketmaster.com	$2a$10$hEFjdjZVcDxq0lIqcPRQE.GVpcWb4OdmeUJTwh0b.9gSSpt7jGo4a	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	2026-01-06 10:58:40.393	\N	\N	ACTIVE	\N	2025-12-04 12:31:19.168	2026-02-06 11:55:45.601	\N
af6ff0c9-ca99-4f42-abe3-6189880de319	gate@marketmaster.com	$2a$10$94WhlTC5P9dS3gQ5pZRFmuysy7I4LXRQW/tC5saYJU8gPUn6pnBvK	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2025-12-04 12:31:19.546	2026-02-06 11:55:48.218	\N
eba31a55-1f70-45a4-af4a-5298ca2cdee7	azwad@gmail.com	$2a$10$C1rfsBWXq7evDh.Wy0G25uPVPxfrxyq.dE0/aOPpYRaxPtH.nZpTO	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	PENDING	\N	2026-01-21 07:08:12.23	2026-01-21 07:08:12.23	\N
e911d798-d05f-4a17-9121-bdc1f1c4076d	super_test@example.com	$2a$10$huA/Kt16AukagS5DhTb/su0TMXuj/mZUKQ6oF0etXeSM/rTmYhmR.	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-21 07:46:01.842	2026-01-21 07:46:01.842	\N
34469dbb-5d1d-42a8-85c1-33ea569eb667	test_mm_1768981848989@mms.ug	$2a$10$dZmFkJX22ruY2qEVG/I71.aUNa81ZZ9hZZRPRhYlEAAOBDeGxloWK	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-21 07:50:53.005	2026-01-21 07:51:05.388	\N
044a55f5-137a-4602-b406-1d0d7c1b7a3b	supplier_1767696776317@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:52:56.318	2026-01-06 10:52:56.318	\N
c5d478b8-71af-4aee-92c4-926a413e4bb8	supplier_1767696810647@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:53:30.649	2026-01-06 10:53:30.649	\N
fa046215-4643-46d4-885c-11263036896e	supplier_1767696860827@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:54:20.828	2026-01-06 10:54:20.828	\N
f2f32470-0a07-4fcc-a1ec-af0cfcb2afcb	supplier_1767696999299@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:56:39.3	2026-01-06 10:56:39.3	\N
bca12b16-1bcb-4616-8ea1-a92baf135371	supplier_1767697055275@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:57:35.277	2026-01-06 10:57:35.277	\N
b9adab58-6828-4f90-9256-71423b9ad32e	test_vendor_1768981873908@example.com	$2a$10$n6Cp42AawseiPrTUgq/6WuF3rznyzT6oJR4VY2Q83/1Y6ZHAJzloa	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-21 07:51:14.92	2026-01-21 07:51:22.444	\N
4ee01195-317a-4f90-bda7-6cec07cd5095	supplier_1767697113511@test.com	hash	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-06 10:58:33.513	2026-01-06 10:58:33.513	\N
eae11fc4-36ad-4ac6-b69e-c7a4e0b05e9f	super@example.com	$2a$10$4sRznSOGqR3N9CDKoaGgS.KLJ7QMngX1DZHzVtVQ.kiTVjLg4ALqm	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-01-21 08:00:39.122	2026-01-21 08:00:39.122	\N
6dc32546-187a-45bc-9950-c08bc31fcd18	abcd@qwerty.com	$2a$10$iRy5BQ7D7o.YdecpeeYkD.l4MNz3YZiILxU6JI0oAynA3S2tHkhKy	1234	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	DELETED	\N	2026-02-06 11:58:08.623	2026-02-06 12:02:35.28	2026-02-06 12:02:35.279
99e86b21-e230-49b9-b0c2-6c5794ba7665	test_vendor@gmail.com	$2a$10$28hyYi2DaxS6ewE00NdNHe3BjQeloNPUUPzTfTI4J8H0Yxpf9Eqgm	\N	f	NONE	\N	\N	\N	f	f	\N	\N	0	\N	\N	\N	\N	PENDING	\N	2026-01-21 09:04:27.749	2026-01-21 09:04:27.749	\N
d37c0d8e-7088-4adc-b719-d0f16b945136	root@gmail.com	$2a$10$P02aTTX8ej2M78.E6qv6P.JAJiEmLiThrgYPhIp0mR/NxUKSe/8Vu	+8801711531854	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	ACTIVE	\N	2026-02-06 12:08:43.153	2026-02-06 12:08:43.153	\N
3d047462-1f81-4de1-aa30-0487351c5ec3	jacksmithstore@gmail.com	$2a$10$KGdJrjFhxKyoJpqN4obPmOUXVh5hH4JSvgYGKQAj2eK4x4IvE/Y1K	+8801711531953	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	DELETED	\N	2026-02-06 12:13:48.482	2026-02-06 12:14:25.478	2026-02-06 12:14:25.476
5945de9f-9e1e-4335-9627-af79080ee48b	vendor_email2@example.com	$2a$10$ow0Qh.WYLY0fYb9DjLJMjOlsTXXj5eK5x9dBnjShQzKiTh79CWZ8G	+2562562536	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	\N	\N	\N	DELETED	\N	2026-02-09 10:30:18.427	2026-02-09 10:40:56.199	2026-02-09 10:40:56.197
adb5cc70-a1a1-4b3a-a628-c07910a7113e	super@super.com	$2a$10$22PnNWdCQnj326gvOKEYBeKpL0jekbEyF7o0Z/mhlcx1zPM3Z.XrW	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	2026-01-28 08:46:11.241	\N	\N	ACTIVE	\N	2026-01-28 08:45:37.539	2026-01-28 08:46:11.242	\N
7f283c4c-82a9-4332-a239-cd218f9fd727	superadmin@super.com	$2a$10$XLwMM4X9vw/3ct3YJxg9q.xFFTPqd57DL8XcGl7LXc3np.a6dQBe.	\N	f	NONE	\N	\N	\N	t	t	\N	\N	0	\N	2026-02-09 10:45:54.274	\N	\N	ACTIVE	\N	2026-01-28 09:02:57.977	2026-02-09 10:45:54.275	\N
256bffc9-58b3-4c08-a3d9-7b91a9f944ae	azwad@oitsdhaka.com	$2a$10$1Oc95e3rqUgj.6hvfXl6VeaeE./.GoFPFw6Uh0wG07iFdnAma0Die	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	2026-02-09 10:57:06.324	\N	\N	ACTIVE	\N	2026-02-09 10:50:28.421	2026-02-09 10:57:06.326	\N
e3cbfe58-c3e9-4335-9b30-88af8689f296	azwadfawadhasan@gmail.com	$2a$10$v9tGwC6fsLTnScTGjTRB6OYADMMdQaFB7z5Vzcd9Id8lH36KAKwnu	\N	f	NONE	\N	\N	\N	t	f	\N	\N	0	\N	2026-02-09 10:59:52.98	\N	\N	ACTIVE	\N	2026-02-09 10:58:52.383	2026-02-09 10:59:52.981	\N
\.


--
-- TOC entry 5556 (class 0 OID 52398)
-- Dependencies: 232
-- Data for Name: vendors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vendors (id, "stakeholderId", "vendorCode", "businessName", "businessType", "businessLicenseNumber", "taxIdNumber", "vatRegistered", "vatNumber", "yearsInBusiness", "preferredMarkets", "primaryMarketId", "marketMasterApprovalId") FROM stdin;
3a2e6fee-124b-4a0c-b22a-8e641dd0b3c6	7f91c723-8169-48e3-a906-a9f4baf71f10	VND-A796A375	My Awesome Shop	\N	\N	\N	f	\N	\N	\N	\N	\N
e8a151e0-47e6-4877-8f5c-ce6cfe06eb02	75110206-b8d7-489b-8f02-fdc5ea9f765b	VND-2C027C06	Automated Test Shop	RETAIL	\N	\N	f	\N	\N	\N	\N	\N
bddb4e1d-7ef3-46a8-8e70-c25986b1e5a2	2ede33e3-3ca5-42c6-bfd9-93d6e27a5a52	VND-7A63C8C5	abcd store	RETAIL	\N	\N	t	VAT-2034	\N	\N	m1	\N
2cc77332-2529-45b6-9b4f-361ac47af60b	c19e535f-2e63-4a57-853f-0524eb0ee0fd	VND-BE9008A7	Sabit's store	RETAIL	\N	\N	t	VAT-20323	\N	\N	m1	\N
233ad38f-173f-4b4c-b934-d5812dd88c05	d0301b48-b95a-4c8a-8db0-a0051b0e35c4	VND-9B20E884	Smith Store	WHOLESALE	\N	\N	t	VAT-2050	\N	\N	m1	\N
0afe53df-bad7-433f-b40a-e6be7f814d73	a1166763-13fc-44ca-8ac8-99535708a89a	VND-118C3AB3	NAV store	RETAIL	\N	\N	t	VAT-2011	\N	\N	m1	\N
20bb21d4-6c12-460c-99f4-ee845ad9c3ef	ce66560c-a0ad-4425-89b2-523fec3ab4c0	VND-16570B2A	Doe Enterprises	RETAIL	\N	\N	t	VAT-1245	\N	\N	m2	\N
bcc2f16e-3b8c-439b-806d-8b9c4b71d346	1840860a-bf57-46c5-88f2-62d54fd6e0ed	VND-F5D29154	Azwad_VENDOR	\N	\N	\N	f	\N	\N	\N	\N	\N
\.


--
-- TOC entry 5544 (class 0 OID 52247)
-- Dependencies: 220
-- Data for Name: verification_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.verification_tokens (id, token, "tokenType", "userId", email, phone, "maxAttempts", attempts, "isUsed", "expiresAt", "usedAt", "ipAddress", "userAgent", location, "purposeData", "createdAt") FROM stdin;
\.


--
-- TOC entry 4741 (class 2606 OID 51876)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 52482)
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (id);


--
-- TOC entry 5029 (class 2606 OID 52645)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5156 (class 2606 OID 52857)
-- Name: business_licenses business_licenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_licenses
    ADD CONSTRAINT business_licenses_pkey PRIMARY KEY (id);


--
-- TOC entry 4805 (class 2606 OID 52301)
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 52510)
-- Name: city_admins city_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_admins
    ADD CONSTRAINT city_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 5182 (class 2606 OID 52905)
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 52428)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 5121 (class 2606 OID 52805)
-- Name: daily_collections daily_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_collections
    ADD CONSTRAINT daily_collections_pkey PRIMARY KEY (id);


--
-- TOC entry 5215 (class 2606 OID 52958)
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- TOC entry 5159 (class 2606 OID 52864)
-- Name: delivery_items delivery_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_items
    ADD CONSTRAINT delivery_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 52684)
-- Name: digital_assets digital_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_assets
    ADD CONSTRAINT digital_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4937 (class 2606 OID 52503)
-- Name: district_admins district_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_admins
    ADD CONSTRAINT district_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 52292)
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 52676)
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5201 (class 2606 OID 52931)
-- Name: gate_entries gate_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT gate_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 5000 (class 2606 OID 52596)
-- Name: gate_operations gate_operations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT gate_operations_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 52282)
-- Name: geolocations geolocations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.geolocations
    ADD CONSTRAINT geolocations_pkey PRIMARY KEY (id);


--
-- TOC entry 5196 (class 2606 OID 52922)
-- Name: guest_entries guest_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_entries
    ADD CONSTRAINT guest_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4893 (class 2606 OID 52435)
-- Name: guests guests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT guests_pkey PRIMARY KEY (id);


--
-- TOC entry 5141 (class 2606 OID 52837)
-- Name: health_inspections health_inspections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_inspections
    ADD CONSTRAINT health_inspections_pkey PRIMARY KEY (id);


--
-- TOC entry 5078 (class 2606 OID 52730)
-- Name: inventory_records inventory_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_records
    ADD CONSTRAINT inventory_records_pkey PRIMARY KEY (id);


--
-- TOC entry 5022 (class 2606 OID 52636)
-- Name: invitations invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT invitations_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 52882)
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5038 (class 2606 OID 52667)
-- Name: kyc_submissions kyc_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT kyc_submissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5189 (class 2606 OID 52914)
-- Name: loyalty_transactions loyalty_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 52370)
-- Name: market_aisles market_aisles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_aisles
    ADD CONSTRAINT market_aisles_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 52388)
-- Name: market_authorities market_authorities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_authorities
    ADD CONSTRAINT market_authorities_pkey PRIMARY KEY (id);


--
-- TOC entry 4955 (class 2606 OID 52539)
-- Name: market_gates market_gates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_gates
    ADD CONSTRAINT market_gates_pkey PRIMARY KEY (id);


--
-- TOC entry 4819 (class 2606 OID 52340)
-- Name: market_levels market_levels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_levels
    ADD CONSTRAINT market_levels_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 52517)
-- Name: market_masters market_masters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_masters
    ADD CONSTRAINT market_masters_pkey PRIMARY KEY (id);


--
-- TOC entry 5147 (class 2606 OID 52847)
-- Name: market_regulations market_regulations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_regulations
    ADD CONSTRAINT market_regulations_pkey PRIMARY KEY (id);


--
-- TOC entry 4827 (class 2606 OID 52357)
-- Name: market_sections market_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_sections
    ADD CONSTRAINT market_sections_pkey PRIMARY KEY (id);


--
-- TOC entry 5099 (class 2606 OID 52758)
-- Name: market_taxes market_taxes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_taxes
    ADD CONSTRAINT market_taxes_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 52554)
-- Name: market_tokens market_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT market_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4811 (class 2606 OID 52321)
-- Name: markets markets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT markets_pkey PRIMARY KEY (id);


--
-- TOC entry 4856 (class 2606 OID 52397)
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 52496)
-- Name: national_admins national_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.national_admins
    ADD CONSTRAINT national_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 52656)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5175 (class 2606 OID 52895)
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5073 (class 2606 OID 52722)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 52524)
-- Name: pseudo_market_admins pseudo_market_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pseudo_market_admins
    ADD CONSTRAINT pseudo_market_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 52578)
-- Name: qr_codes qr_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT qr_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 5108 (class 2606 OID 52787)
-- Name: qr_generation_configs qr_generation_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_generation_configs
    ADD CONSTRAINT qr_generation_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4991 (class 2606 OID 52586)
-- Name: qr_scan_logs qr_scan_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT qr_scan_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5133 (class 2606 OID 52827)
-- Name: rent_contracts rent_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_contracts
    ADD CONSTRAINT rent_contracts_pkey PRIMARY KEY (id);


--
-- TOC entry 5126 (class 2606 OID 52816)
-- Name: rent_payments rent_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT rent_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 52627)
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 5008 (class 2606 OID 52605)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 5065 (class 2606 OID 52711)
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 52704)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 5116 (class 2606 OID 52796)
-- Name: scanner_devices scanner_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scanner_devices
    ADD CONSTRAINT scanner_devices_pkey PRIMARY KEY (id);


--
-- TOC entry 5206 (class 2606 OID 52940)
-- Name: shop_assets shop_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_assets
    ADD CONSTRAINT shop_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 52455)
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 52381)
-- Name: stakeholders stakeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT stakeholders_pkey PRIMARY KEY (id);


--
-- TOC entry 5211 (class 2606 OID 52949)
-- Name: stall_assets stall_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stall_assets
    ADD CONSTRAINT stall_assets_pkey PRIMARY KEY (id);


--
-- TOC entry 4909 (class 2606 OID 52474)
-- Name: stalls stalls_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT stalls_pkey PRIMARY KEY (id);


--
-- TOC entry 5086 (class 2606 OID 52738)
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 52489)
-- Name: super_admins super_admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admins
    ADD CONSTRAINT super_admins_pkey PRIMARY KEY (id);


--
-- TOC entry 5166 (class 2606 OID 52875)
-- Name: supplier_invoices supplier_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_invoices
    ADD CONSTRAINT supplier_invoices_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 52414)
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- TOC entry 5091 (class 2606 OID 52747)
-- Name: tax_payments tax_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_payments
    ADD CONSTRAINT tax_payments_pkey PRIMARY KEY (id);


--
-- TOC entry 5104 (class 2606 OID 52772)
-- Name: token_generation_configs token_generation_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_generation_configs
    ADD CONSTRAINT token_generation_configs_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 52562)
-- Name: token_usage_logs token_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT token_usage_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5053 (class 2606 OID 52694)
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 52246)
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 5011 (class 2606 OID 52615)
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 52268)
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4751 (class 2606 OID 52230)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 52405)
-- Name: vendors vendors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT vendors_pkey PRIMARY KEY (id);


--
-- TOC entry 4773 (class 2606 OID 52257)
-- Name: verification_tokens verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4918 (class 1259 OID 53097)
-- Name: admins_adminLevel_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "admins_adminLevel_idx" ON public.admins USING btree ("adminLevel");


--
-- TOC entry 4919 (class 1259 OID 53099)
-- Name: admins_assignedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "admins_assignedAt_idx" ON public.admins USING btree ("assignedAt");


--
-- TOC entry 4920 (class 1259 OID 53098)
-- Name: admins_employeeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "admins_employeeId_idx" ON public.admins USING btree ("employeeId");


--
-- TOC entry 4921 (class 1259 OID 53096)
-- Name: admins_employeeId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "admins_employeeId_key" ON public.admins USING btree ("employeeId");


--
-- TOC entry 4924 (class 1259 OID 53095)
-- Name: admins_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "admins_userId_key" ON public.admins USING btree ("userId");


--
-- TOC entry 5025 (class 1259 OID 53168)
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- TOC entry 5026 (class 1259 OID 53171)
-- Name: audit_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_createdAt_idx" ON public.audit_logs USING btree ("createdAt");


--
-- TOC entry 5027 (class 1259 OID 53169)
-- Name: audit_logs_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_entityType_entityId_idx" ON public.audit_logs USING btree ("entityType", "entityId");


--
-- TOC entry 5030 (class 1259 OID 53170)
-- Name: audit_logs_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "audit_logs_userId_idx" ON public.audit_logs USING btree ("userId");


--
-- TOC entry 5150 (class 1259 OID 53255)
-- Name: business_licenses_expiryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "business_licenses_expiryDate_idx" ON public.business_licenses USING btree ("expiryDate");


--
-- TOC entry 5151 (class 1259 OID 53254)
-- Name: business_licenses_licenseNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "business_licenses_licenseNumber_idx" ON public.business_licenses USING btree ("licenseNumber");


--
-- TOC entry 5152 (class 1259 OID 53251)
-- Name: business_licenses_licenseNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "business_licenses_licenseNumber_key" ON public.business_licenses USING btree ("licenseNumber");


--
-- TOC entry 5153 (class 1259 OID 53253)
-- Name: business_licenses_licenseeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "business_licenses_licenseeId_idx" ON public.business_licenses USING btree ("licenseeId");


--
-- TOC entry 5154 (class 1259 OID 53252)
-- Name: business_licenses_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "business_licenses_marketId_idx" ON public.business_licenses USING btree ("marketId");


--
-- TOC entry 4800 (class 1259 OID 53008)
-- Name: cities_cityType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cities_cityType_idx" ON public.cities USING btree ("cityType");


--
-- TOC entry 4801 (class 1259 OID 53006)
-- Name: cities_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cities_code_idx ON public.cities USING btree (code);


--
-- TOC entry 4802 (class 1259 OID 53005)
-- Name: cities_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX cities_code_key ON public.cities USING btree (code);


--
-- TOC entry 4803 (class 1259 OID 53007)
-- Name: cities_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "cities_districtId_idx" ON public.cities USING btree ("districtId");


--
-- TOC entry 4938 (class 1259 OID 53107)
-- Name: city_admins_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "city_admins_adminId_key" ON public.city_admins USING btree ("adminId");


--
-- TOC entry 4939 (class 1259 OID 53108)
-- Name: city_admins_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "city_admins_cityId_idx" ON public.city_admins USING btree ("cityId");


--
-- TOC entry 5179 (class 1259 OID 53274)
-- Name: complaints_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "complaints_createdAt_idx" ON public.complaints USING btree ("createdAt");


--
-- TOC entry 5180 (class 1259 OID 53270)
-- Name: complaints_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "complaints_customerId_idx" ON public.complaints USING btree ("customerId");


--
-- TOC entry 5183 (class 1259 OID 53273)
-- Name: complaints_priority_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX complaints_priority_idx ON public.complaints USING btree (priority);


--
-- TOC entry 5184 (class 1259 OID 53271)
-- Name: complaints_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "complaints_stallId_idx" ON public.complaints USING btree ("stallId");


--
-- TOC entry 5185 (class 1259 OID 53272)
-- Name: complaints_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX complaints_status_idx ON public.complaints USING btree (status);


--
-- TOC entry 4882 (class 1259 OID 53069)
-- Name: customers_customerCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_customerCode_idx" ON public.customers USING btree ("customerCode");


--
-- TOC entry 4883 (class 1259 OID 53068)
-- Name: customers_customerCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "customers_customerCode_key" ON public.customers USING btree ("customerCode");


--
-- TOC entry 4884 (class 1259 OID 53070)
-- Name: customers_customerType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_customerType_idx" ON public.customers USING btree ("customerType");


--
-- TOC entry 4885 (class 1259 OID 53071)
-- Name: customers_loyaltyPoints_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "customers_loyaltyPoints_idx" ON public.customers USING btree ("loyaltyPoints");


--
-- TOC entry 4888 (class 1259 OID 53067)
-- Name: customers_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "customers_stakeholderId_key" ON public.customers USING btree ("stakeholderId");


--
-- TOC entry 5118 (class 1259 OID 53230)
-- Name: daily_collections_collectorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "daily_collections_collectorId_idx" ON public.daily_collections USING btree ("collectorId");


--
-- TOC entry 5119 (class 1259 OID 53229)
-- Name: daily_collections_marketId_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "daily_collections_marketId_date_idx" ON public.daily_collections USING btree ("marketId", date);


--
-- TOC entry 5122 (class 1259 OID 53231)
-- Name: daily_collections_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX daily_collections_status_idx ON public.daily_collections USING btree (status);


--
-- TOC entry 5213 (class 1259 OID 53294)
-- Name: deliveries_deliveryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deliveries_deliveryDate_idx" ON public.deliveries USING btree ("deliveryDate");


--
-- TOC entry 5216 (class 1259 OID 53293)
-- Name: deliveries_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deliveries_stallId_idx" ON public.deliveries USING btree ("stallId");


--
-- TOC entry 5217 (class 1259 OID 53295)
-- Name: deliveries_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX deliveries_status_idx ON public.deliveries USING btree (status);


--
-- TOC entry 5218 (class 1259 OID 53292)
-- Name: deliveries_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "deliveries_supplierId_idx" ON public.deliveries USING btree ("supplierId");


--
-- TOC entry 5157 (class 1259 OID 53256)
-- Name: delivery_items_deliveryId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "delivery_items_deliveryId_idx" ON public.delivery_items USING btree ("deliveryId");


--
-- TOC entry 5160 (class 1259 OID 53257)
-- Name: delivery_items_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "delivery_items_productId_idx" ON public.delivery_items USING btree ("productId");


--
-- TOC entry 5046 (class 1259 OID 53182)
-- Name: digital_assets_assetType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "digital_assets_assetType_idx" ON public.digital_assets USING btree ("assetType");


--
-- TOC entry 5049 (class 1259 OID 53181)
-- Name: digital_assets_stakeholderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "digital_assets_stakeholderId_idx" ON public.digital_assets USING btree ("stakeholderId");


--
-- TOC entry 5050 (class 1259 OID 53183)
-- Name: digital_assets_uploadedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "digital_assets_uploadedAt_idx" ON public.digital_assets USING btree ("uploadedAt");


--
-- TOC entry 4934 (class 1259 OID 53105)
-- Name: district_admins_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "district_admins_adminId_key" ON public.district_admins USING btree ("adminId");


--
-- TOC entry 4935 (class 1259 OID 53106)
-- Name: district_admins_districtId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "district_admins_districtId_idx" ON public.district_admins USING btree ("districtId");


--
-- TOC entry 4794 (class 1259 OID 53002)
-- Name: districts_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX districts_code_idx ON public.districts USING btree (code);


--
-- TOC entry 4795 (class 1259 OID 53001)
-- Name: districts_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX districts_code_key ON public.districts USING btree (code);


--
-- TOC entry 4796 (class 1259 OID 53004)
-- Name: districts_districtType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "districts_districtType_idx" ON public.districts USING btree ("districtType");


--
-- TOC entry 4797 (class 1259 OID 53003)
-- Name: districts_geolocationId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "districts_geolocationId_idx" ON public.districts USING btree ("geolocationId");


--
-- TOC entry 5043 (class 1259 OID 53178)
-- Name: documents_stakeholderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "documents_stakeholderId_idx" ON public.documents USING btree ("stakeholderId");


--
-- TOC entry 5044 (class 1259 OID 53180)
-- Name: documents_uploadedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "documents_uploadedAt_idx" ON public.documents USING btree ("uploadedAt");


--
-- TOC entry 5045 (class 1259 OID 53179)
-- Name: documents_verificationStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "documents_verificationStatus_idx" ON public.documents USING btree ("verificationStatus");


--
-- TOC entry 5197 (class 1259 OID 53285)
-- Name: gate_entries_entryTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_entries_entryTime_idx" ON public.gate_entries USING btree ("entryTime");


--
-- TOC entry 5198 (class 1259 OID 53283)
-- Name: gate_entries_gateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_entries_gateId_idx" ON public.gate_entries USING btree ("gateId");


--
-- TOC entry 5199 (class 1259 OID 53282)
-- Name: gate_entries_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_entries_marketId_idx" ON public.gate_entries USING btree ("marketId");


--
-- TOC entry 5202 (class 1259 OID 53284)
-- Name: gate_entries_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_entries_vendorId_idx" ON public.gate_entries USING btree ("vendorId");


--
-- TOC entry 4996 (class 1259 OID 53155)
-- Name: gate_operations_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_createdAt_idx" ON public.gate_operations USING btree ("createdAt");


--
-- TOC entry 4997 (class 1259 OID 53149)
-- Name: gate_operations_gateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_gateId_idx" ON public.gate_operations USING btree ("gateId");


--
-- TOC entry 4998 (class 1259 OID 53152)
-- Name: gate_operations_inspectorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_inspectorId_idx" ON public.gate_operations USING btree ("inspectorId");


--
-- TOC entry 5001 (class 1259 OID 53151)
-- Name: gate_operations_qrCodeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_qrCodeId_idx" ON public.gate_operations USING btree ("qrCodeId");


--
-- TOC entry 5002 (class 1259 OID 53153)
-- Name: gate_operations_recordedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_recordedById_idx" ON public.gate_operations USING btree ("recordedById");


--
-- TOC entry 5003 (class 1259 OID 53150)
-- Name: gate_operations_tokenId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_tokenId_idx" ON public.gate_operations USING btree ("tokenId");


--
-- TOC entry 5004 (class 1259 OID 53154)
-- Name: gate_operations_validatedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "gate_operations_validatedById_idx" ON public.gate_operations USING btree ("validatedById");


--
-- TOC entry 4788 (class 1259 OID 52998)
-- Name: geolocations_code_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX geolocations_code_idx ON public.geolocations USING btree (code);


--
-- TOC entry 4789 (class 1259 OID 52997)
-- Name: geolocations_code_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX geolocations_code_key ON public.geolocations USING btree (code);


--
-- TOC entry 4790 (class 1259 OID 52999)
-- Name: geolocations_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX geolocations_country_idx ON public.geolocations USING btree (country);


--
-- TOC entry 4793 (class 1259 OID 53000)
-- Name: geolocations_regionType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "geolocations_regionType_idx" ON public.geolocations USING btree ("regionType");


--
-- TOC entry 5192 (class 1259 OID 53281)
-- Name: guest_entries_entryTime_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guest_entries_entryTime_idx" ON public.guest_entries USING btree ("entryTime");


--
-- TOC entry 5193 (class 1259 OID 53279)
-- Name: guest_entries_guestId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guest_entries_guestId_idx" ON public.guest_entries USING btree ("guestId");


--
-- TOC entry 5194 (class 1259 OID 53280)
-- Name: guest_entries_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guest_entries_marketId_idx" ON public.guest_entries USING btree ("marketId");


--
-- TOC entry 4889 (class 1259 OID 53076)
-- Name: guests_expiryDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guests_expiryDate_idx" ON public.guests USING btree ("expiryDate");


--
-- TOC entry 4890 (class 1259 OID 53075)
-- Name: guests_guestCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guests_guestCode_idx" ON public.guests USING btree ("guestCode");


--
-- TOC entry 4891 (class 1259 OID 53073)
-- Name: guests_guestCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "guests_guestCode_key" ON public.guests USING btree ("guestCode");


--
-- TOC entry 4894 (class 1259 OID 53077)
-- Name: guests_sponsorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "guests_sponsorId_idx" ON public.guests USING btree ("sponsorId");


--
-- TOC entry 4895 (class 1259 OID 53072)
-- Name: guests_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "guests_stakeholderId_key" ON public.guests USING btree ("stakeholderId");


--
-- TOC entry 4896 (class 1259 OID 53074)
-- Name: guests_temporaryId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "guests_temporaryId_key" ON public.guests USING btree ("temporaryId");


--
-- TOC entry 5137 (class 1259 OID 53244)
-- Name: health_inspections_inspectionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "health_inspections_inspectionDate_idx" ON public.health_inspections USING btree ("inspectionDate");


--
-- TOC entry 5138 (class 1259 OID 53245)
-- Name: health_inspections_inspectorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "health_inspections_inspectorId_idx" ON public.health_inspections USING btree ("inspectorId");


--
-- TOC entry 5139 (class 1259 OID 53242)
-- Name: health_inspections_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "health_inspections_marketId_idx" ON public.health_inspections USING btree ("marketId");


--
-- TOC entry 5142 (class 1259 OID 53243)
-- Name: health_inspections_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "health_inspections_stallId_idx" ON public.health_inspections USING btree ("stallId");


--
-- TOC entry 5079 (class 1259 OID 53202)
-- Name: inventory_records_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_records_productId_idx" ON public.inventory_records USING btree ("productId");


--
-- TOC entry 5080 (class 1259 OID 53203)
-- Name: inventory_records_recordType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_records_recordType_idx" ON public.inventory_records USING btree ("recordType");


--
-- TOC entry 5081 (class 1259 OID 53204)
-- Name: inventory_records_recordedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "inventory_records_recordedAt_idx" ON public.inventory_records USING btree ("recordedAt");


--
-- TOC entry 5019 (class 1259 OID 53165)
-- Name: invitations_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_email_idx ON public.invitations USING btree (email);


--
-- TOC entry 5020 (class 1259 OID 53167)
-- Name: invitations_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invitations_expiresAt_idx" ON public.invitations USING btree ("expiresAt");


--
-- TOC entry 5023 (class 1259 OID 53166)
-- Name: invitations_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX invitations_token_idx ON public.invitations USING btree (token);


--
-- TOC entry 5024 (class 1259 OID 53164)
-- Name: invitations_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX invitations_token_key ON public.invitations USING btree (token);


--
-- TOC entry 5169 (class 1259 OID 53264)
-- Name: invoice_items_invoiceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_items_invoiceId_idx" ON public.invoice_items USING btree ("invoiceId");


--
-- TOC entry 5172 (class 1259 OID 53265)
-- Name: invoice_items_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "invoice_items_productId_idx" ON public.invoice_items USING btree ("productId");


--
-- TOC entry 5039 (class 1259 OID 53176)
-- Name: kyc_submissions_stakeholderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kyc_submissions_stakeholderId_idx" ON public.kyc_submissions USING btree ("stakeholderId");


--
-- TOC entry 5040 (class 1259 OID 53177)
-- Name: kyc_submissions_submissionDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "kyc_submissions_submissionDate_idx" ON public.kyc_submissions USING btree ("submissionDate");


--
-- TOC entry 5186 (class 1259 OID 53278)
-- Name: loyalty_transactions_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loyalty_transactions_createdAt_idx" ON public.loyalty_transactions USING btree ("createdAt");


--
-- TOC entry 5187 (class 1259 OID 53275)
-- Name: loyalty_transactions_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loyalty_transactions_customerId_idx" ON public.loyalty_transactions USING btree ("customerId");


--
-- TOC entry 5190 (class 1259 OID 53277)
-- Name: loyalty_transactions_referenceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "loyalty_transactions_referenceId_idx" ON public.loyalty_transactions USING btree ("referenceId");


--
-- TOC entry 5191 (class 1259 OID 53276)
-- Name: loyalty_transactions_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX loyalty_transactions_type_idx ON public.loyalty_transactions USING btree (type);


--
-- TOC entry 4832 (class 1259 OID 53032)
-- Name: market_aisles_aisleNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_aisles_aisleNumber_idx" ON public.market_aisles USING btree ("aisleNumber");


--
-- TOC entry 4833 (class 1259 OID 53033)
-- Name: market_aisles_aisleType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_aisles_aisleType_idx" ON public.market_aisles USING btree ("aisleType");


--
-- TOC entry 4836 (class 1259 OID 53034)
-- Name: market_aisles_sectionId_aisleNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_aisles_sectionId_aisleNumber_key" ON public.market_aisles USING btree ("sectionId", "aisleNumber");


--
-- TOC entry 4837 (class 1259 OID 53031)
-- Name: market_aisles_sectionId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_aisles_sectionId_idx" ON public.market_aisles USING btree ("sectionId");


--
-- TOC entry 4838 (class 1259 OID 53030)
-- Name: market_aisles_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_aisles_uniqueCode_idx" ON public.market_aisles USING btree ("uniqueCode");


--
-- TOC entry 4839 (class 1259 OID 53029)
-- Name: market_aisles_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_aisles_uniqueCode_key" ON public.market_aisles USING btree ("uniqueCode");


--
-- TOC entry 4846 (class 1259 OID 53041)
-- Name: market_authorities_authorityName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_authorities_authorityName_idx" ON public.market_authorities USING btree ("authorityName");


--
-- TOC entry 4849 (class 1259 OID 53042)
-- Name: market_authorities_registrationNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_authorities_registrationNumber_idx" ON public.market_authorities USING btree ("registrationNumber");


--
-- TOC entry 4850 (class 1259 OID 53040)
-- Name: market_authorities_registrationNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_authorities_registrationNumber_key" ON public.market_authorities USING btree ("registrationNumber");


--
-- TOC entry 4851 (class 1259 OID 53039)
-- Name: market_authorities_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_authorities_stakeholderId_key" ON public.market_authorities USING btree ("stakeholderId");


--
-- TOC entry 4951 (class 1259 OID 53117)
-- Name: market_gates_gateType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_gates_gateType_idx" ON public.market_gates USING btree ("gateType");


--
-- TOC entry 4952 (class 1259 OID 53118)
-- Name: market_gates_marketId_gateNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_gates_marketId_gateNumber_key" ON public.market_gates USING btree ("marketId", "gateNumber");


--
-- TOC entry 4953 (class 1259 OID 53116)
-- Name: market_gates_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_gates_marketId_idx" ON public.market_gates USING btree ("marketId");


--
-- TOC entry 4956 (class 1259 OID 53115)
-- Name: market_gates_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_gates_uniqueCode_idx" ON public.market_gates USING btree ("uniqueCode");


--
-- TOC entry 4957 (class 1259 OID 53114)
-- Name: market_gates_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_gates_uniqueCode_key" ON public.market_gates USING btree ("uniqueCode");


--
-- TOC entry 4815 (class 1259 OID 53019)
-- Name: market_levels_levelNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_levels_levelNumber_idx" ON public.market_levels USING btree ("levelNumber");


--
-- TOC entry 4816 (class 1259 OID 53018)
-- Name: market_levels_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_levels_marketId_idx" ON public.market_levels USING btree ("marketId");


--
-- TOC entry 4817 (class 1259 OID 53021)
-- Name: market_levels_marketId_levelNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_levels_marketId_levelNumber_key" ON public.market_levels USING btree ("marketId", "levelNumber");


--
-- TOC entry 4820 (class 1259 OID 53020)
-- Name: market_levels_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX market_levels_status_idx ON public.market_levels USING btree (status);


--
-- TOC entry 4821 (class 1259 OID 53017)
-- Name: market_levels_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_levels_uniqueCode_idx" ON public.market_levels USING btree ("uniqueCode");


--
-- TOC entry 4822 (class 1259 OID 53016)
-- Name: market_levels_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_levels_uniqueCode_key" ON public.market_levels USING btree ("uniqueCode");


--
-- TOC entry 4942 (class 1259 OID 53109)
-- Name: market_masters_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_masters_adminId_key" ON public.market_masters USING btree ("adminId");


--
-- TOC entry 4943 (class 1259 OID 53110)
-- Name: market_masters_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_masters_marketId_idx" ON public.market_masters USING btree ("marketId");


--
-- TOC entry 5143 (class 1259 OID 53248)
-- Name: market_regulations_authorityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_regulations_authorityId_idx" ON public.market_regulations USING btree ("authorityId");


--
-- TOC entry 5144 (class 1259 OID 53249)
-- Name: market_regulations_effectiveDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_regulations_effectiveDate_idx" ON public.market_regulations USING btree ("effectiveDate");


--
-- TOC entry 5145 (class 1259 OID 53247)
-- Name: market_regulations_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_regulations_marketId_idx" ON public.market_regulations USING btree ("marketId");


--
-- TOC entry 5148 (class 1259 OID 53246)
-- Name: market_regulations_regulationNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_regulations_regulationNumber_key" ON public.market_regulations USING btree ("regulationNumber");


--
-- TOC entry 5149 (class 1259 OID 53250)
-- Name: market_regulations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX market_regulations_status_idx ON public.market_regulations USING btree (status);


--
-- TOC entry 4823 (class 1259 OID 53025)
-- Name: market_sections_levelId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_sections_levelId_idx" ON public.market_sections USING btree ("levelId");


--
-- TOC entry 4824 (class 1259 OID 53024)
-- Name: market_sections_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_sections_marketId_idx" ON public.market_sections USING btree ("marketId");


--
-- TOC entry 4825 (class 1259 OID 53028)
-- Name: market_sections_marketId_levelId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_sections_marketId_levelId_name_key" ON public.market_sections USING btree ("marketId", "levelId", name);


--
-- TOC entry 4828 (class 1259 OID 53026)
-- Name: market_sections_sectionType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_sections_sectionType_idx" ON public.market_sections USING btree ("sectionType");


--
-- TOC entry 4829 (class 1259 OID 53027)
-- Name: market_sections_supervisorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_sections_supervisorId_idx" ON public.market_sections USING btree ("supervisorId");


--
-- TOC entry 4830 (class 1259 OID 53023)
-- Name: market_sections_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_sections_uniqueCode_idx" ON public.market_sections USING btree ("uniqueCode");


--
-- TOC entry 4831 (class 1259 OID 53022)
-- Name: market_sections_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_sections_uniqueCode_key" ON public.market_sections USING btree ("uniqueCode");


--
-- TOC entry 5096 (class 1259 OID 53217)
-- Name: market_taxes_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_taxes_isActive_idx" ON public.market_taxes USING btree ("isActive");


--
-- TOC entry 5097 (class 1259 OID 53215)
-- Name: market_taxes_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_taxes_marketId_idx" ON public.market_taxes USING btree ("marketId");


--
-- TOC entry 5100 (class 1259 OID 53216)
-- Name: market_taxes_taxType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_taxes_taxType_idx" ON public.market_taxes USING btree ("taxType");


--
-- TOC entry 4958 (class 1259 OID 53129)
-- Name: market_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_expiresAt_idx" ON public.market_tokens USING btree ("expiresAt");


--
-- TOC entry 4959 (class 1259 OID 53126)
-- Name: market_tokens_gateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_gateId_idx" ON public.market_tokens USING btree ("gateId");


--
-- TOC entry 4960 (class 1259 OID 53130)
-- Name: market_tokens_issuedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_issuedAt_idx" ON public.market_tokens USING btree ("issuedAt");


--
-- TOC entry 4961 (class 1259 OID 53125)
-- Name: market_tokens_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_marketId_idx" ON public.market_tokens USING btree ("marketId");


--
-- TOC entry 4964 (class 1259 OID 53123)
-- Name: market_tokens_shortCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_shortCode_idx" ON public.market_tokens USING btree ("shortCode");


--
-- TOC entry 4965 (class 1259 OID 53120)
-- Name: market_tokens_shortCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_tokens_shortCode_key" ON public.market_tokens USING btree ("shortCode");


--
-- TOC entry 4966 (class 1259 OID 53128)
-- Name: market_tokens_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX market_tokens_status_idx ON public.market_tokens USING btree (status);


--
-- TOC entry 4967 (class 1259 OID 53122)
-- Name: market_tokens_tokenCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_tokenCode_idx" ON public.market_tokens USING btree ("tokenCode");


--
-- TOC entry 4968 (class 1259 OID 53119)
-- Name: market_tokens_tokenCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_tokens_tokenCode_key" ON public.market_tokens USING btree ("tokenCode");


--
-- TOC entry 4969 (class 1259 OID 53124)
-- Name: market_tokens_tokenType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_tokenType_idx" ON public.market_tokens USING btree ("tokenType");


--
-- TOC entry 4970 (class 1259 OID 53121)
-- Name: market_tokens_tokenValue_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "market_tokens_tokenValue_key" ON public.market_tokens USING btree ("tokenValue");


--
-- TOC entry 4971 (class 1259 OID 53127)
-- Name: market_tokens_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "market_tokens_vendorId_idx" ON public.market_tokens USING btree ("vendorId");


--
-- TOC entry 4806 (class 1259 OID 53011)
-- Name: markets_cityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "markets_cityId_idx" ON public.markets USING btree ("cityId");


--
-- TOC entry 4807 (class 1259 OID 53015)
-- Name: markets_cityId_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "markets_cityId_name_key" ON public.markets USING btree ("cityId", name);


--
-- TOC entry 4808 (class 1259 OID 53014)
-- Name: markets_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "markets_createdAt_idx" ON public.markets USING btree ("createdAt");


--
-- TOC entry 4809 (class 1259 OID 53012)
-- Name: markets_marketType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "markets_marketType_idx" ON public.markets USING btree ("marketType");


--
-- TOC entry 4812 (class 1259 OID 53013)
-- Name: markets_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX markets_status_idx ON public.markets USING btree (status);


--
-- TOC entry 4813 (class 1259 OID 53010)
-- Name: markets_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "markets_uniqueCode_idx" ON public.markets USING btree ("uniqueCode");


--
-- TOC entry 4814 (class 1259 OID 53009)
-- Name: markets_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "markets_uniqueCode_key" ON public.markets USING btree ("uniqueCode");


--
-- TOC entry 4852 (class 1259 OID 53049)
-- Name: members_businessName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "members_businessName_idx" ON public.members USING btree ("businessName");


--
-- TOC entry 4853 (class 1259 OID 53048)
-- Name: members_membershipNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "members_membershipNumber_idx" ON public.members USING btree ("membershipNumber");


--
-- TOC entry 4854 (class 1259 OID 53044)
-- Name: members_membershipNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_membershipNumber_key" ON public.members USING btree ("membershipNumber");


--
-- TOC entry 4857 (class 1259 OID 53050)
-- Name: members_registrationNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "members_registrationNumber_idx" ON public.members USING btree ("registrationNumber");


--
-- TOC entry 4858 (class 1259 OID 53045)
-- Name: members_registrationNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_registrationNumber_key" ON public.members USING btree ("registrationNumber");


--
-- TOC entry 4859 (class 1259 OID 53043)
-- Name: members_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_stakeholderId_key" ON public.members USING btree ("stakeholderId");


--
-- TOC entry 4860 (class 1259 OID 53046)
-- Name: members_taxIdNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_taxIdNumber_key" ON public.members USING btree ("taxIdNumber");


--
-- TOC entry 4861 (class 1259 OID 53047)
-- Name: members_tradeLicenseNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "members_tradeLicenseNumber_key" ON public.members USING btree ("tradeLicenseNumber");


--
-- TOC entry 4928 (class 1259 OID 53101)
-- Name: national_admins_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "national_admins_adminId_key" ON public.national_admins USING btree ("adminId");


--
-- TOC entry 4929 (class 1259 OID 53103)
-- Name: national_admins_ministry_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX national_admins_ministry_idx ON public.national_admins USING btree (ministry);


--
-- TOC entry 4932 (class 1259 OID 53104)
-- Name: national_admins_taxAuthorityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "national_admins_taxAuthorityId_idx" ON public.national_admins USING btree ("taxAuthorityId");


--
-- TOC entry 4933 (class 1259 OID 53102)
-- Name: national_admins_taxAuthorityId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "national_admins_taxAuthorityId_key" ON public.national_admins USING btree ("taxAuthorityId");


--
-- TOC entry 5031 (class 1259 OID 53175)
-- Name: notifications_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_createdAt_idx" ON public.notifications USING btree ("createdAt");


--
-- TOC entry 5032 (class 1259 OID 53174)
-- Name: notifications_isRead_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_isRead_idx" ON public.notifications USING btree ("isRead");


--
-- TOC entry 5035 (class 1259 OID 53173)
-- Name: notifications_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_type_idx ON public.notifications USING btree (type);


--
-- TOC entry 5036 (class 1259 OID 53172)
-- Name: notifications_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "notifications_userId_idx" ON public.notifications USING btree ("userId");


--
-- TOC entry 5173 (class 1259 OID 53267)
-- Name: product_reviews_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_reviews_customerId_idx" ON public.product_reviews USING btree ("customerId");


--
-- TOC entry 5176 (class 1259 OID 53266)
-- Name: product_reviews_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "product_reviews_productId_idx" ON public.product_reviews USING btree ("productId");


--
-- TOC entry 5177 (class 1259 OID 53268)
-- Name: product_reviews_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_reviews_rating_idx ON public.product_reviews USING btree (rating);


--
-- TOC entry 5178 (class 1259 OID 53269)
-- Name: product_reviews_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX product_reviews_status_idx ON public.product_reviews USING btree (status);


--
-- TOC entry 5068 (class 1259 OID 53200)
-- Name: products_barcode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_barcode_idx ON public.products USING btree (barcode);


--
-- TOC entry 5069 (class 1259 OID 53196)
-- Name: products_barcode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_barcode_key ON public.products USING btree (barcode);


--
-- TOC entry 5070 (class 1259 OID 53198)
-- Name: products_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_category_idx ON public.products USING btree (category);


--
-- TOC entry 5071 (class 1259 OID 53201)
-- Name: products_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_isActive_idx" ON public.products USING btree ("isActive");


--
-- TOC entry 5074 (class 1259 OID 53199)
-- Name: products_sku_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_sku_idx ON public.products USING btree (sku);


--
-- TOC entry 5075 (class 1259 OID 53195)
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- TOC entry 5076 (class 1259 OID 53197)
-- Name: products_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "products_stallId_idx" ON public.products USING btree ("stallId");


--
-- TOC entry 4946 (class 1259 OID 53111)
-- Name: pseudo_market_admins_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "pseudo_market_admins_adminId_key" ON public.pseudo_market_admins USING btree ("adminId");


--
-- TOC entry 4947 (class 1259 OID 53112)
-- Name: pseudo_market_admins_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "pseudo_market_admins_marketId_idx" ON public.pseudo_market_admins USING btree ("marketId");


--
-- TOC entry 4950 (class 1259 OID 53113)
-- Name: pseudo_market_admins_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX pseudo_market_admins_role_idx ON public.pseudo_market_admins USING btree (role);


--
-- TOC entry 4979 (class 1259 OID 53141)
-- Name: qr_codes_entityType_entityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_entityType_entityId_idx" ON public.qr_codes USING btree ("entityType", "entityId");


--
-- TOC entry 4980 (class 1259 OID 53143)
-- Name: qr_codes_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_expiresAt_idx" ON public.qr_codes USING btree ("expiresAt");


--
-- TOC entry 4981 (class 1259 OID 53142)
-- Name: qr_codes_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_isActive_idx" ON public.qr_codes USING btree ("isActive");


--
-- TOC entry 4984 (class 1259 OID 53138)
-- Name: qr_codes_qrCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_qrCode_idx" ON public.qr_codes USING btree ("qrCode");


--
-- TOC entry 4985 (class 1259 OID 53136)
-- Name: qr_codes_qrCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "qr_codes_qrCode_key" ON public.qr_codes USING btree ("qrCode");


--
-- TOC entry 4986 (class 1259 OID 53140)
-- Name: qr_codes_qrType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_qrType_idx" ON public.qr_codes USING btree ("qrType");


--
-- TOC entry 4987 (class 1259 OID 53139)
-- Name: qr_codes_shortCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_codes_shortCode_idx" ON public.qr_codes USING btree ("shortCode");


--
-- TOC entry 4988 (class 1259 OID 53137)
-- Name: qr_codes_shortCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "qr_codes_shortCode_key" ON public.qr_codes USING btree ("shortCode");


--
-- TOC entry 5105 (class 1259 OID 53221)
-- Name: qr_generation_configs_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_generation_configs_isActive_idx" ON public.qr_generation_configs USING btree ("isActive");


--
-- TOC entry 5106 (class 1259 OID 53220)
-- Name: qr_generation_configs_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_generation_configs_marketId_idx" ON public.qr_generation_configs USING btree ("marketId");


--
-- TOC entry 4989 (class 1259 OID 53148)
-- Name: qr_scan_logs_isValid_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_scan_logs_isValid_idx" ON public.qr_scan_logs USING btree ("isValid");


--
-- TOC entry 4992 (class 1259 OID 53144)
-- Name: qr_scan_logs_qrCodeId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_scan_logs_qrCodeId_idx" ON public.qr_scan_logs USING btree ("qrCodeId");


--
-- TOC entry 4993 (class 1259 OID 53146)
-- Name: qr_scan_logs_scannedAtGateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_scan_logs_scannedAtGateId_idx" ON public.qr_scan_logs USING btree ("scannedAtGateId");


--
-- TOC entry 4994 (class 1259 OID 53147)
-- Name: qr_scan_logs_scannedAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_scan_logs_scannedAt_idx" ON public.qr_scan_logs USING btree ("scannedAt");


--
-- TOC entry 4995 (class 1259 OID 53145)
-- Name: qr_scan_logs_scannedByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "qr_scan_logs_scannedByUserId_idx" ON public.qr_scan_logs USING btree ("scannedByUserId");


--
-- TOC entry 5129 (class 1259 OID 53241)
-- Name: rent_contracts_contractNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_contracts_contractNumber_idx" ON public.rent_contracts USING btree ("contractNumber");


--
-- TOC entry 5130 (class 1259 OID 53236)
-- Name: rent_contracts_contractNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "rent_contracts_contractNumber_key" ON public.rent_contracts USING btree ("contractNumber");


--
-- TOC entry 5131 (class 1259 OID 53238)
-- Name: rent_contracts_landlordId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_contracts_landlordId_idx" ON public.rent_contracts USING btree ("landlordId");


--
-- TOC entry 5134 (class 1259 OID 53237)
-- Name: rent_contracts_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_contracts_shopId_idx" ON public.rent_contracts USING btree ("shopId");


--
-- TOC entry 5135 (class 1259 OID 53240)
-- Name: rent_contracts_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rent_contracts_status_idx ON public.rent_contracts USING btree (status);


--
-- TOC entry 5136 (class 1259 OID 53239)
-- Name: rent_contracts_tenantId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_contracts_tenantId_idx" ON public.rent_contracts USING btree ("tenantId");


--
-- TOC entry 5123 (class 1259 OID 53233)
-- Name: rent_payments_contractId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_payments_contractId_idx" ON public.rent_payments USING btree ("contractId");


--
-- TOC entry 5124 (class 1259 OID 53234)
-- Name: rent_payments_paymentDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "rent_payments_paymentDate_idx" ON public.rent_payments USING btree ("paymentDate");


--
-- TOC entry 5127 (class 1259 OID 53232)
-- Name: rent_payments_receiptNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "rent_payments_receiptNumber_key" ON public.rent_payments USING btree ("receiptNumber");


--
-- TOC entry 5128 (class 1259 OID 53235)
-- Name: rent_payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX rent_payments_status_idx ON public.rent_payments USING btree (status);


--
-- TOC entry 5017 (class 1259 OID 53162)
-- Name: role_permissions_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "role_permissions_roleId_idx" ON public.role_permissions USING btree ("roleId");


--
-- TOC entry 5018 (class 1259 OID 53163)
-- Name: role_permissions_roleId_resource_action_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "role_permissions_roleId_resource_action_key" ON public.role_permissions USING btree ("roleId", resource, action);


--
-- TOC entry 5005 (class 1259 OID 53157)
-- Name: roles_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX roles_name_idx ON public.roles USING btree (name);


--
-- TOC entry 5006 (class 1259 OID 53156)
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- TOC entry 5066 (class 1259 OID 53194)
-- Name: sale_items_productId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sale_items_productId_idx" ON public.sale_items USING btree ("productId");


--
-- TOC entry 5067 (class 1259 OID 53193)
-- Name: sale_items_saleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sale_items_saleId_idx" ON public.sale_items USING btree ("saleId");


--
-- TOC entry 5058 (class 1259 OID 53190)
-- Name: sales_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_customerId_idx" ON public.sales USING btree ("customerId");


--
-- TOC entry 5059 (class 1259 OID 53192)
-- Name: sales_paymentStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_paymentStatus_idx" ON public.sales USING btree ("paymentStatus");


--
-- TOC entry 5062 (class 1259 OID 53191)
-- Name: sales_saleDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_saleDate_idx" ON public.sales USING btree ("saleDate");


--
-- TOC entry 5063 (class 1259 OID 53189)
-- Name: sales_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "sales_stallId_idx" ON public.sales USING btree ("stallId");


--
-- TOC entry 5109 (class 1259 OID 53224)
-- Name: scanner_devices_deviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scanner_devices_deviceId_idx" ON public.scanner_devices USING btree ("deviceId");


--
-- TOC entry 5110 (class 1259 OID 53222)
-- Name: scanner_devices_deviceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "scanner_devices_deviceId_key" ON public.scanner_devices USING btree ("deviceId");


--
-- TOC entry 5111 (class 1259 OID 53226)
-- Name: scanner_devices_gateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scanner_devices_gateId_idx" ON public.scanner_devices USING btree ("gateId");


--
-- TOC entry 5112 (class 1259 OID 53227)
-- Name: scanner_devices_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scanner_devices_isActive_idx" ON public.scanner_devices USING btree ("isActive");


--
-- TOC entry 5113 (class 1259 OID 53228)
-- Name: scanner_devices_lastSeen_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scanner_devices_lastSeen_idx" ON public.scanner_devices USING btree ("lastSeen");


--
-- TOC entry 5114 (class 1259 OID 53225)
-- Name: scanner_devices_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "scanner_devices_marketId_idx" ON public.scanner_devices USING btree ("marketId");


--
-- TOC entry 5117 (class 1259 OID 53223)
-- Name: scanner_devices_serialNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "scanner_devices_serialNumber_key" ON public.scanner_devices USING btree ("serialNumber");


--
-- TOC entry 5203 (class 1259 OID 53287)
-- Name: shop_assets_assetType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shop_assets_assetType_idx" ON public.shop_assets USING btree ("assetType");


--
-- TOC entry 5204 (class 1259 OID 53288)
-- Name: shop_assets_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shop_assets_isActive_idx" ON public.shop_assets USING btree ("isActive");


--
-- TOC entry 5207 (class 1259 OID 53286)
-- Name: shop_assets_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shop_assets_shopId_idx" ON public.shop_assets USING btree ("shopId");


--
-- TOC entry 4897 (class 1259 OID 53080)
-- Name: shops_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_marketId_idx" ON public.shops USING btree ("marketId");


--
-- TOC entry 4898 (class 1259 OID 53085)
-- Name: shops_marketId_shopNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "shops_marketId_shopNumber_key" ON public.shops USING btree ("marketId", "shopNumber");


--
-- TOC entry 4899 (class 1259 OID 53081)
-- Name: shops_memberId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_memberId_idx" ON public.shops USING btree ("memberId");


--
-- TOC entry 4900 (class 1259 OID 53084)
-- Name: shops_occupationStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_occupationStatus_idx" ON public.shops USING btree ("occupationStatus");


--
-- TOC entry 4903 (class 1259 OID 53082)
-- Name: shops_shopType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_shopType_idx" ON public.shops USING btree ("shopType");


--
-- TOC entry 4904 (class 1259 OID 53083)
-- Name: shops_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shops_status_idx ON public.shops USING btree (status);


--
-- TOC entry 4905 (class 1259 OID 53079)
-- Name: shops_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "shops_uniqueCode_idx" ON public.shops USING btree ("uniqueCode");


--
-- TOC entry 4906 (class 1259 OID 53078)
-- Name: shops_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "shops_uniqueCode_key" ON public.shops USING btree ("uniqueCode");


--
-- TOC entry 4840 (class 1259 OID 53038)
-- Name: stakeholders_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stakeholders_createdAt_idx" ON public.stakeholders USING btree ("createdAt");


--
-- TOC entry 4841 (class 1259 OID 53037)
-- Name: stakeholders_kycStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stakeholders_kycStatus_idx" ON public.stakeholders USING btree ("kycStatus");


--
-- TOC entry 4844 (class 1259 OID 53036)
-- Name: stakeholders_stakeholderType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stakeholders_stakeholderType_idx" ON public.stakeholders USING btree ("stakeholderType");


--
-- TOC entry 4845 (class 1259 OID 53035)
-- Name: stakeholders_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stakeholders_userId_key" ON public.stakeholders USING btree ("userId");


--
-- TOC entry 5208 (class 1259 OID 53290)
-- Name: stall_assets_assetType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stall_assets_assetType_idx" ON public.stall_assets USING btree ("assetType");


--
-- TOC entry 5209 (class 1259 OID 53291)
-- Name: stall_assets_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stall_assets_isActive_idx" ON public.stall_assets USING btree ("isActive");


--
-- TOC entry 5212 (class 1259 OID 53289)
-- Name: stall_assets_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stall_assets_stallId_idx" ON public.stall_assets USING btree ("stallId");


--
-- TOC entry 4907 (class 1259 OID 53091)
-- Name: stalls_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stalls_category_idx ON public.stalls USING btree (category);


--
-- TOC entry 4910 (class 1259 OID 53087)
-- Name: stalls_qrCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stalls_qrCode_key" ON public.stalls USING btree ("qrCode");


--
-- TOC entry 4911 (class 1259 OID 53089)
-- Name: stalls_shopId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stalls_shopId_idx" ON public.stalls USING btree ("shopId");


--
-- TOC entry 4912 (class 1259 OID 53094)
-- Name: stalls_shopId_stallNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stalls_shopId_stallNumber_key" ON public.stalls USING btree ("shopId", "stallNumber");


--
-- TOC entry 4913 (class 1259 OID 53092)
-- Name: stalls_stallType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stalls_stallType_idx" ON public.stalls USING btree ("stallType");


--
-- TOC entry 4914 (class 1259 OID 53093)
-- Name: stalls_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stalls_status_idx ON public.stalls USING btree (status);


--
-- TOC entry 4915 (class 1259 OID 53088)
-- Name: stalls_uniqueCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stalls_uniqueCode_idx" ON public.stalls USING btree ("uniqueCode");


--
-- TOC entry 4916 (class 1259 OID 53086)
-- Name: stalls_uniqueCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "stalls_uniqueCode_key" ON public.stalls USING btree ("uniqueCode");


--
-- TOC entry 4917 (class 1259 OID 53090)
-- Name: stalls_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stalls_vendorId_idx" ON public.stalls USING btree ("vendorId");


--
-- TOC entry 5082 (class 1259 OID 53208)
-- Name: stock_movements_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_movements_createdAt_idx" ON public.stock_movements USING btree ("createdAt");


--
-- TOC entry 5083 (class 1259 OID 53205)
-- Name: stock_movements_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_movements_marketId_idx" ON public.stock_movements USING btree ("marketId");


--
-- TOC entry 5084 (class 1259 OID 53207)
-- Name: stock_movements_movementType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_movements_movementType_idx" ON public.stock_movements USING btree ("movementType");


--
-- TOC entry 5087 (class 1259 OID 53206)
-- Name: stock_movements_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "stock_movements_stallId_idx" ON public.stock_movements USING btree ("stallId");


--
-- TOC entry 4925 (class 1259 OID 53100)
-- Name: super_admins_adminId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "super_admins_adminId_key" ON public.super_admins USING btree ("adminId");


--
-- TOC entry 5161 (class 1259 OID 53262)
-- Name: supplier_invoices_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_invoices_dueDate_idx" ON public.supplier_invoices USING btree ("dueDate");


--
-- TOC entry 5162 (class 1259 OID 53261)
-- Name: supplier_invoices_invoiceNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_invoices_invoiceNumber_idx" ON public.supplier_invoices USING btree ("invoiceNumber");


--
-- TOC entry 5163 (class 1259 OID 53258)
-- Name: supplier_invoices_invoiceNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "supplier_invoices_invoiceNumber_key" ON public.supplier_invoices USING btree ("invoiceNumber");


--
-- TOC entry 5164 (class 1259 OID 53263)
-- Name: supplier_invoices_paymentStatus_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_invoices_paymentStatus_idx" ON public.supplier_invoices USING btree ("paymentStatus");


--
-- TOC entry 5167 (class 1259 OID 53260)
-- Name: supplier_invoices_stallId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_invoices_stallId_idx" ON public.supplier_invoices USING btree ("stallId");


--
-- TOC entry 5168 (class 1259 OID 53259)
-- Name: supplier_invoices_supplierId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "supplier_invoices_supplierId_idx" ON public.supplier_invoices USING btree ("supplierId");


--
-- TOC entry 4873 (class 1259 OID 53065)
-- Name: suppliers_businessName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "suppliers_businessName_idx" ON public.suppliers USING btree ("businessName");


--
-- TOC entry 4874 (class 1259 OID 53062)
-- Name: suppliers_licenseNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "suppliers_licenseNumber_key" ON public.suppliers USING btree ("licenseNumber");


--
-- TOC entry 4877 (class 1259 OID 53060)
-- Name: suppliers_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "suppliers_stakeholderId_key" ON public.suppliers USING btree ("stakeholderId");


--
-- TOC entry 4878 (class 1259 OID 53064)
-- Name: suppliers_supplierCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "suppliers_supplierCode_idx" ON public.suppliers USING btree ("supplierCode");


--
-- TOC entry 4879 (class 1259 OID 53061)
-- Name: suppliers_supplierCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON public.suppliers USING btree ("supplierCode");


--
-- TOC entry 4880 (class 1259 OID 53066)
-- Name: suppliers_supplierType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "suppliers_supplierType_idx" ON public.suppliers USING btree ("supplierType");


--
-- TOC entry 4881 (class 1259 OID 53063)
-- Name: suppliers_taxId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "suppliers_taxId_key" ON public.suppliers USING btree ("taxId");


--
-- TOC entry 5088 (class 1259 OID 53214)
-- Name: tax_payments_dueDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tax_payments_dueDate_idx" ON public.tax_payments USING btree ("dueDate");


--
-- TOC entry 5089 (class 1259 OID 53210)
-- Name: tax_payments_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tax_payments_marketId_idx" ON public.tax_payments USING btree ("marketId");


--
-- TOC entry 5092 (class 1259 OID 53209)
-- Name: tax_payments_receiptNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "tax_payments_receiptNumber_key" ON public.tax_payments USING btree ("receiptNumber");


--
-- TOC entry 5093 (class 1259 OID 53213)
-- Name: tax_payments_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tax_payments_status_idx ON public.tax_payments USING btree (status);


--
-- TOC entry 5094 (class 1259 OID 53212)
-- Name: tax_payments_taxType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tax_payments_taxType_idx" ON public.tax_payments USING btree ("taxType");


--
-- TOC entry 5095 (class 1259 OID 53211)
-- Name: tax_payments_vendorId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "tax_payments_vendorId_idx" ON public.tax_payments USING btree ("vendorId");


--
-- TOC entry 5101 (class 1259 OID 53219)
-- Name: token_generation_configs_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_generation_configs_isActive_idx" ON public.token_generation_configs USING btree ("isActive");


--
-- TOC entry 5102 (class 1259 OID 53218)
-- Name: token_generation_configs_marketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_generation_configs_marketId_idx" ON public.token_generation_configs USING btree ("marketId");


--
-- TOC entry 4972 (class 1259 OID 53132)
-- Name: token_usage_logs_action_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX token_usage_logs_action_idx ON public.token_usage_logs USING btree (action);


--
-- TOC entry 4973 (class 1259 OID 53135)
-- Name: token_usage_logs_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_usage_logs_createdAt_idx" ON public.token_usage_logs USING btree ("createdAt");


--
-- TOC entry 4976 (class 1259 OID 53131)
-- Name: token_usage_logs_tokenId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_usage_logs_tokenId_idx" ON public.token_usage_logs USING btree ("tokenId");


--
-- TOC entry 4977 (class 1259 OID 53134)
-- Name: token_usage_logs_usedAtGateId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_usage_logs_usedAtGateId_idx" ON public.token_usage_logs USING btree ("usedAtGateId");


--
-- TOC entry 4978 (class 1259 OID 53133)
-- Name: token_usage_logs_usedByUserId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "token_usage_logs_usedByUserId_idx" ON public.token_usage_logs USING btree ("usedByUserId");


--
-- TOC entry 5051 (class 1259 OID 53188)
-- Name: transactions_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transactions_createdAt_idx" ON public.transactions USING btree ("createdAt");


--
-- TOC entry 5054 (class 1259 OID 53184)
-- Name: transactions_referenceId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "transactions_referenceId_key" ON public.transactions USING btree ("referenceId");


--
-- TOC entry 5055 (class 1259 OID 53185)
-- Name: transactions_stakeholderId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "transactions_stakeholderId_idx" ON public.transactions USING btree ("stakeholderId");


--
-- TOC entry 5056 (class 1259 OID 53187)
-- Name: transactions_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_status_idx ON public.transactions USING btree (status);


--
-- TOC entry 5057 (class 1259 OID 53186)
-- Name: transactions_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX transactions_type_idx ON public.transactions USING btree (type);


--
-- TOC entry 4753 (class 1259 OID 52980)
-- Name: user_profiles_country_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_profiles_country_idx ON public.user_profiles USING btree (country);


--
-- TOC entry 4754 (class 1259 OID 52977)
-- Name: user_profiles_dateOfBirth_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_dateOfBirth_idx" ON public.user_profiles USING btree ("dateOfBirth");


--
-- TOC entry 4755 (class 1259 OID 52976)
-- Name: user_profiles_gender_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_profiles_gender_idx ON public.user_profiles USING btree (gender);


--
-- TOC entry 4756 (class 1259 OID 52973)
-- Name: user_profiles_nationalId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_nationalId_idx" ON public.user_profiles USING btree ("nationalId");


--
-- TOC entry 4757 (class 1259 OID 52969)
-- Name: user_profiles_nationalId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_nationalId_key" ON public.user_profiles USING btree ("nationalId");


--
-- TOC entry 4758 (class 1259 OID 52974)
-- Name: user_profiles_passportNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_passportNumber_idx" ON public.user_profiles USING btree ("passportNumber");


--
-- TOC entry 4759 (class 1259 OID 52970)
-- Name: user_profiles_passportNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_passportNumber_key" ON public.user_profiles USING btree ("passportNumber");


--
-- TOC entry 4760 (class 1259 OID 52979)
-- Name: user_profiles_personalQRCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_personalQRCode_idx" ON public.user_profiles USING btree ("personalQRCode");


--
-- TOC entry 4761 (class 1259 OID 52972)
-- Name: user_profiles_personalQRCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_personalQRCode_key" ON public.user_profiles USING btree ("personalQRCode");


--
-- TOC entry 4764 (class 1259 OID 52975)
-- Name: user_profiles_taxIdNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_taxIdNumber_idx" ON public.user_profiles USING btree ("taxIdNumber");


--
-- TOC entry 4765 (class 1259 OID 52971)
-- Name: user_profiles_taxIdNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_taxIdNumber_key" ON public.user_profiles USING btree ("taxIdNumber");


--
-- TOC entry 4766 (class 1259 OID 52968)
-- Name: user_profiles_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_profiles_userId_key" ON public.user_profiles USING btree ("userId");


--
-- TOC entry 4767 (class 1259 OID 52978)
-- Name: user_profiles_verificationLevel_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_profiles_verificationLevel_idx" ON public.user_profiles USING btree ("verificationLevel");


--
-- TOC entry 5009 (class 1259 OID 53160)
-- Name: user_roles_assignedById_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_roles_assignedById_idx" ON public.user_roles USING btree ("assignedById");


--
-- TOC entry 5012 (class 1259 OID 53159)
-- Name: user_roles_roleId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_roles_roleId_idx" ON public.user_roles USING btree ("roleId");


--
-- TOC entry 5013 (class 1259 OID 53158)
-- Name: user_roles_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_roles_userId_idx" ON public.user_roles USING btree ("userId");


--
-- TOC entry 5014 (class 1259 OID 53161)
-- Name: user_roles_userId_roleId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON public.user_roles USING btree ("userId", "roleId");


--
-- TOC entry 4778 (class 1259 OID 52994)
-- Name: user_sessions_deviceId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_deviceId_idx" ON public.user_sessions USING btree ("deviceId");


--
-- TOC entry 4779 (class 1259 OID 52996)
-- Name: user_sessions_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_expiresAt_idx" ON public.user_sessions USING btree ("expiresAt");


--
-- TOC entry 4780 (class 1259 OID 52995)
-- Name: user_sessions_isActive_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_isActive_idx" ON public.user_sessions USING btree ("isActive");


--
-- TOC entry 4783 (class 1259 OID 52993)
-- Name: user_sessions_refreshToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_refreshToken_idx" ON public.user_sessions USING btree ("refreshToken");


--
-- TOC entry 4784 (class 1259 OID 52990)
-- Name: user_sessions_refreshToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_sessions_refreshToken_key" ON public.user_sessions USING btree ("refreshToken");


--
-- TOC entry 4785 (class 1259 OID 52992)
-- Name: user_sessions_sessionToken_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_sessionToken_idx" ON public.user_sessions USING btree ("sessionToken");


--
-- TOC entry 4786 (class 1259 OID 52989)
-- Name: user_sessions_sessionToken_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON public.user_sessions USING btree ("sessionToken");


--
-- TOC entry 4787 (class 1259 OID 52991)
-- Name: user_sessions_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "user_sessions_userId_idx" ON public.user_sessions USING btree ("userId");


--
-- TOC entry 4742 (class 1259 OID 52966)
-- Name: users_createdAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_createdAt_idx" ON public.users USING btree ("createdAt");


--
-- TOC entry 4743 (class 1259 OID 52964)
-- Name: users_emailVerified_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_emailVerified_idx" ON public.users USING btree ("emailVerified");


--
-- TOC entry 4744 (class 1259 OID 52961)
-- Name: users_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_email_idx ON public.users USING btree (email);


--
-- TOC entry 4745 (class 1259 OID 52959)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4746 (class 1259 OID 52967)
-- Name: users_lastLogin_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_lastLogin_idx" ON public.users USING btree ("lastLogin");


--
-- TOC entry 4747 (class 1259 OID 52965)
-- Name: users_phoneVerified_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "users_phoneVerified_idx" ON public.users USING btree ("phoneVerified");


--
-- TOC entry 4748 (class 1259 OID 52962)
-- Name: users_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_phone_idx ON public.users USING btree (phone);


--
-- TOC entry 4749 (class 1259 OID 52960)
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- TOC entry 4752 (class 1259 OID 52963)
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- TOC entry 4862 (class 1259 OID 53058)
-- Name: vendors_businessLicenseNumber_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vendors_businessLicenseNumber_idx" ON public.vendors USING btree ("businessLicenseNumber");


--
-- TOC entry 4863 (class 1259 OID 53053)
-- Name: vendors_businessLicenseNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_businessLicenseNumber_key" ON public.vendors USING btree ("businessLicenseNumber");


--
-- TOC entry 4864 (class 1259 OID 53057)
-- Name: vendors_businessName_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vendors_businessName_idx" ON public.vendors USING btree ("businessName");


--
-- TOC entry 4867 (class 1259 OID 53059)
-- Name: vendors_primaryMarketId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vendors_primaryMarketId_idx" ON public.vendors USING btree ("primaryMarketId");


--
-- TOC entry 4868 (class 1259 OID 53051)
-- Name: vendors_stakeholderId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_stakeholderId_key" ON public.vendors USING btree ("stakeholderId");


--
-- TOC entry 4869 (class 1259 OID 53054)
-- Name: vendors_taxIdNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_taxIdNumber_key" ON public.vendors USING btree ("taxIdNumber");


--
-- TOC entry 4870 (class 1259 OID 53055)
-- Name: vendors_vatNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_vatNumber_key" ON public.vendors USING btree ("vatNumber");


--
-- TOC entry 4871 (class 1259 OID 53056)
-- Name: vendors_vendorCode_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "vendors_vendorCode_idx" ON public.vendors USING btree ("vendorCode");


--
-- TOC entry 4872 (class 1259 OID 53052)
-- Name: vendors_vendorCode_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "vendors_vendorCode_key" ON public.vendors USING btree ("vendorCode");


--
-- TOC entry 4768 (class 1259 OID 52985)
-- Name: verification_tokens_email_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verification_tokens_email_idx ON public.verification_tokens USING btree (email);


--
-- TOC entry 4769 (class 1259 OID 52987)
-- Name: verification_tokens_expiresAt_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "verification_tokens_expiresAt_idx" ON public.verification_tokens USING btree ("expiresAt");


--
-- TOC entry 4770 (class 1259 OID 52988)
-- Name: verification_tokens_isUsed_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "verification_tokens_isUsed_idx" ON public.verification_tokens USING btree ("isUsed");


--
-- TOC entry 4771 (class 1259 OID 52986)
-- Name: verification_tokens_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verification_tokens_phone_idx ON public.verification_tokens USING btree (phone);


--
-- TOC entry 4774 (class 1259 OID 72859)
-- Name: verification_tokens_tokenType_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "verification_tokens_tokenType_idx" ON public.verification_tokens USING btree ("tokenType");


--
-- TOC entry 4775 (class 1259 OID 52982)
-- Name: verification_tokens_token_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX verification_tokens_token_idx ON public.verification_tokens USING btree (token);


--
-- TOC entry 4776 (class 1259 OID 52981)
-- Name: verification_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX verification_tokens_token_key ON public.verification_tokens USING btree (token);


--
-- TOC entry 4777 (class 1259 OID 52984)
-- Name: verification_tokens_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "verification_tokens_userId_idx" ON public.verification_tokens USING btree ("userId");


--
-- TOC entry 5260 (class 2606 OID 53506)
-- Name: admins admins_assignedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "admins_assignedByAdminId_fkey" FOREIGN KEY ("assignedByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5261 (class 2606 OID 53501)
-- Name: admins admins_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5316 (class 2606 OID 53786)
-- Name: audit_logs audit_logs_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5317 (class 2606 OID 53791)
-- Name: audit_logs audit_logs_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5318 (class 2606 OID 53781)
-- Name: audit_logs audit_logs_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5369 (class 2606 OID 54046)
-- Name: business_licenses business_licenses_authorityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_licenses
    ADD CONSTRAINT "business_licenses_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES public.market_authorities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5370 (class 2606 OID 54051)
-- Name: business_licenses business_licenses_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.business_licenses
    ADD CONSTRAINT "business_licenses_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5224 (class 2606 OID 53321)
-- Name: cities cities_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT "cities_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5266 (class 2606 OID 53531)
-- Name: city_admins city_admins_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_admins
    ADD CONSTRAINT "city_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5267 (class 2606 OID 53536)
-- Name: city_admins city_admins_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.city_admins
    ADD CONSTRAINT "city_admins_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5377 (class 2606 OID 54086)
-- Name: complaints complaints_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT "complaints_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5243 (class 2606 OID 53416)
-- Name: customers customers_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5353 (class 2606 OID 53971)
-- Name: daily_collections daily_collections_collectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_collections
    ADD CONSTRAINT "daily_collections_collectorId_fkey" FOREIGN KEY ("collectorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5354 (class 2606 OID 53981)
-- Name: daily_collections daily_collections_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_collections
    ADD CONSTRAINT "daily_collections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5355 (class 2606 OID 53966)
-- Name: daily_collections daily_collections_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_collections
    ADD CONSTRAINT "daily_collections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5356 (class 2606 OID 53976)
-- Name: daily_collections daily_collections_verifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.daily_collections
    ADD CONSTRAINT "daily_collections_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5393 (class 2606 OID 54176)
-- Name: deliveries deliveries_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5394 (class 2606 OID 54166)
-- Name: deliveries deliveries_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5395 (class 2606 OID 54171)
-- Name: deliveries deliveries_verifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT "deliveries_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5371 (class 2606 OID 54056)
-- Name: delivery_items delivery_items_deliveryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_items
    ADD CONSTRAINT "delivery_items_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES public.deliveries(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5325 (class 2606 OID 53826)
-- Name: digital_assets digital_assets_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_assets
    ADD CONSTRAINT "digital_assets_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5326 (class 2606 OID 53831)
-- Name: digital_assets digital_assets_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.digital_assets
    ADD CONSTRAINT "digital_assets_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5264 (class 2606 OID 53521)
-- Name: district_admins district_admins_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_admins
    ADD CONSTRAINT "district_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5265 (class 2606 OID 53526)
-- Name: district_admins district_admins_districtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.district_admins
    ADD CONSTRAINT "district_admins_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5223 (class 2606 OID 53316)
-- Name: districts districts_geolocationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "districts_geolocationId_fkey" FOREIGN KEY ("geolocationId") REFERENCES public.geolocations(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5322 (class 2606 OID 53811)
-- Name: documents documents_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5323 (class 2606 OID 53821)
-- Name: documents documents_uploadedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5324 (class 2606 OID 53816)
-- Name: documents documents_verifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT "documents_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5383 (class 2606 OID 54136)
-- Name: gate_entries gate_entries_counterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_counterId_fkey" FOREIGN KEY ("counterId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5384 (class 2606 OID 54141)
-- Name: gate_entries gate_entries_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5385 (class 2606 OID 54121)
-- Name: gate_entries gate_entries_gateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5386 (class 2606 OID 54116)
-- Name: gate_entries gate_entries_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5387 (class 2606 OID 54131)
-- Name: gate_entries gate_entries_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5388 (class 2606 OID 54126)
-- Name: gate_entries gate_entries_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_entries
    ADD CONSTRAINT "gate_entries_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5297 (class 2606 OID 53686)
-- Name: gate_operations gate_operations_gateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5298 (class 2606 OID 53701)
-- Name: gate_operations gate_operations_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5299 (class 2606 OID 53696)
-- Name: gate_operations gate_operations_qrCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES public.qr_codes(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5300 (class 2606 OID 53706)
-- Name: gate_operations gate_operations_recordedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5301 (class 2606 OID 53691)
-- Name: gate_operations gate_operations_tokenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES public.market_tokens(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5302 (class 2606 OID 53711)
-- Name: gate_operations gate_operations_validatedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate_operations
    ADD CONSTRAINT "gate_operations_validatedById_fkey" FOREIGN KEY ("validatedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5380 (class 2606 OID 54111)
-- Name: guest_entries guest_entries_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_entries
    ADD CONSTRAINT "guest_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5381 (class 2606 OID 54101)
-- Name: guest_entries guest_entries_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_entries
    ADD CONSTRAINT "guest_entries_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5382 (class 2606 OID 54106)
-- Name: guest_entries guest_entries_verifiedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guest_entries
    ADD CONSTRAINT "guest_entries_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5244 (class 2606 OID 53426)
-- Name: guests guests_sponsorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5245 (class 2606 OID 53421)
-- Name: guests guests_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guests
    ADD CONSTRAINT "guests_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5363 (class 2606 OID 54031)
-- Name: health_inspections health_inspections_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_inspections
    ADD CONSTRAINT "health_inspections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5364 (class 2606 OID 54026)
-- Name: health_inspections health_inspections_inspectorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_inspections
    ADD CONSTRAINT "health_inspections_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5365 (class 2606 OID 54016)
-- Name: health_inspections health_inspections_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_inspections
    ADD CONSTRAINT "health_inspections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5366 (class 2606 OID 54021)
-- Name: health_inspections health_inspections_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.health_inspections
    ADD CONSTRAINT "health_inspections_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5336 (class 2606 OID 53881)
-- Name: inventory_records inventory_records_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_records
    ADD CONSTRAINT "inventory_records_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5337 (class 2606 OID 53886)
-- Name: inventory_records inventory_records_recordedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_records
    ADD CONSTRAINT "inventory_records_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5308 (class 2606 OID 53761)
-- Name: invitations invitations_acceptedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_acceptedByUserId_fkey" FOREIGN KEY ("acceptedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5309 (class 2606 OID 53771)
-- Name: invitations invitations_cityScopeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_cityScopeId_fkey" FOREIGN KEY ("cityScopeId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5310 (class 2606 OID 53766)
-- Name: invitations invitations_districtScopeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_districtScopeId_fkey" FOREIGN KEY ("districtScopeId") REFERENCES public.districts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5311 (class 2606 OID 53776)
-- Name: invitations invitations_marketScopeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_marketScopeId_fkey" FOREIGN KEY ("marketScopeId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5312 (class 2606 OID 53751)
-- Name: invitations invitations_sentByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_sentByAdminId_fkey" FOREIGN KEY ("sentByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5313 (class 2606 OID 53756)
-- Name: invitations invitations_sentByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_sentByUserId_fkey" FOREIGN KEY ("sentByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5314 (class 2606 OID 53746)
-- Name: invitations invitations_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5315 (class 2606 OID 53741)
-- Name: invitations invitations_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invitations
    ADD CONSTRAINT "invitations_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5374 (class 2606 OID 54071)
-- Name: invoice_items invoice_items_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT "invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public.supplier_invoices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5320 (class 2606 OID 53806)
-- Name: kyc_submissions kyc_submissions_reviewedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT "kyc_submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5321 (class 2606 OID 53801)
-- Name: kyc_submissions kyc_submissions_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kyc_submissions
    ADD CONSTRAINT "kyc_submissions_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5378 (class 2606 OID 54096)
-- Name: loyalty_transactions loyalty_transactions_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT "loyalty_transactions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5379 (class 2606 OID 54091)
-- Name: loyalty_transactions loyalty_transactions_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_transactions
    ADD CONSTRAINT "loyalty_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5233 (class 2606 OID 53371)
-- Name: market_aisles market_aisles_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_aisles
    ADD CONSTRAINT "market_aisles_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5234 (class 2606 OID 53366)
-- Name: market_aisles market_aisles_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_aisles
    ADD CONSTRAINT "market_aisles_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.market_sections(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5237 (class 2606 OID 53386)
-- Name: market_authorities market_authorities_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_authorities
    ADD CONSTRAINT "market_authorities_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5272 (class 2606 OID 53571)
-- Name: market_gates market_gates_assignedCounterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_gates
    ADD CONSTRAINT "market_gates_assignedCounterId_fkey" FOREIGN KEY ("assignedCounterId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5273 (class 2606 OID 53566)
-- Name: market_gates market_gates_assignedStaffId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_gates
    ADD CONSTRAINT "market_gates_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5274 (class 2606 OID 53576)
-- Name: market_gates market_gates_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_gates
    ADD CONSTRAINT "market_gates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5275 (class 2606 OID 53561)
-- Name: market_gates market_gates_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_gates
    ADD CONSTRAINT "market_gates_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5227 (class 2606 OID 53341)
-- Name: market_levels market_levels_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_levels
    ADD CONSTRAINT "market_levels_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5228 (class 2606 OID 53336)
-- Name: market_levels market_levels_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_levels
    ADD CONSTRAINT "market_levels_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5268 (class 2606 OID 53541)
-- Name: market_masters market_masters_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_masters
    ADD CONSTRAINT "market_masters_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5269 (class 2606 OID 53546)
-- Name: market_masters market_masters_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_masters
    ADD CONSTRAINT "market_masters_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5367 (class 2606 OID 54036)
-- Name: market_regulations market_regulations_authorityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_regulations
    ADD CONSTRAINT "market_regulations_authorityId_fkey" FOREIGN KEY ("authorityId") REFERENCES public.market_authorities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5368 (class 2606 OID 54041)
-- Name: market_regulations market_regulations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_regulations
    ADD CONSTRAINT "market_regulations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5229 (class 2606 OID 53361)
-- Name: market_sections market_sections_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_sections
    ADD CONSTRAINT "market_sections_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5230 (class 2606 OID 53351)
-- Name: market_sections market_sections_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_sections
    ADD CONSTRAINT "market_sections_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public.market_levels(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5231 (class 2606 OID 53346)
-- Name: market_sections market_sections_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_sections
    ADD CONSTRAINT "market_sections_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5232 (class 2606 OID 53356)
-- Name: market_sections market_sections_supervisorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_sections
    ADD CONSTRAINT "market_sections_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5345 (class 2606 OID 53931)
-- Name: market_taxes market_taxes_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_taxes
    ADD CONSTRAINT "market_taxes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5346 (class 2606 OID 53926)
-- Name: market_taxes market_taxes_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_taxes
    ADD CONSTRAINT "market_taxes_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5276 (class 2606 OID 53606)
-- Name: market_tokens market_tokens_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5277 (class 2606 OID 53621)
-- Name: market_tokens market_tokens_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5278 (class 2606 OID 53601)
-- Name: market_tokens market_tokens_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5279 (class 2606 OID 53586)
-- Name: market_tokens market_tokens_gateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5280 (class 2606 OID 53616)
-- Name: market_tokens market_tokens_guestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES public.guests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5281 (class 2606 OID 53581)
-- Name: market_tokens market_tokens_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5282 (class 2606 OID 53591)
-- Name: market_tokens market_tokens_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5283 (class 2606 OID 53611)
-- Name: market_tokens market_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5284 (class 2606 OID 53596)
-- Name: market_tokens market_tokens_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.market_tokens
    ADD CONSTRAINT "market_tokens_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5225 (class 2606 OID 53326)
-- Name: markets markets_cityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT "markets_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES public.cities(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5226 (class 2606 OID 53331)
-- Name: markets markets_createdByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.markets
    ADD CONSTRAINT "markets_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5238 (class 2606 OID 53391)
-- Name: members members_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT "members_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5263 (class 2606 OID 53516)
-- Name: national_admins national_admins_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.national_admins
    ADD CONSTRAINT "national_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5319 (class 2606 OID 53796)
-- Name: notifications notifications_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5375 (class 2606 OID 54081)
-- Name: product_reviews product_reviews_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5376 (class 2606 OID 54076)
-- Name: product_reviews product_reviews_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT "product_reviews_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5333 (class 2606 OID 53876)
-- Name: products products_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5334 (class 2606 OID 53866)
-- Name: products products_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5335 (class 2606 OID 53871)
-- Name: products products_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT "products_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5270 (class 2606 OID 53551)
-- Name: pseudo_market_admins pseudo_market_admins_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pseudo_market_admins
    ADD CONSTRAINT "pseudo_market_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5271 (class 2606 OID 53556)
-- Name: pseudo_market_admins pseudo_market_admins_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pseudo_market_admins
    ADD CONSTRAINT "pseudo_market_admins_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5290 (class 2606 OID 53651)
-- Name: qr_codes qr_codes_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "qr_codes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5291 (class 2606 OID 53656)
-- Name: qr_codes qr_codes_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_codes
    ADD CONSTRAINT "qr_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5349 (class 2606 OID 53946)
-- Name: qr_generation_configs qr_generation_configs_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_generation_configs
    ADD CONSTRAINT "qr_generation_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5292 (class 2606 OID 53661)
-- Name: qr_scan_logs qr_scan_logs_qrCodeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT "qr_scan_logs_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES public.qr_codes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5293 (class 2606 OID 53676)
-- Name: qr_scan_logs qr_scan_logs_scannedAtGateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT "qr_scan_logs_scannedAtGateId_fkey" FOREIGN KEY ("scannedAtGateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5294 (class 2606 OID 53671)
-- Name: qr_scan_logs qr_scan_logs_scannedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT "qr_scan_logs_scannedByAdminId_fkey" FOREIGN KEY ("scannedByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5295 (class 2606 OID 53666)
-- Name: qr_scan_logs qr_scan_logs_scannedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT "qr_scan_logs_scannedByUserId_fkey" FOREIGN KEY ("scannedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5296 (class 2606 OID 53681)
-- Name: qr_scan_logs qr_scan_logs_scannerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.qr_scan_logs
    ADD CONSTRAINT "qr_scan_logs_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES public.scanner_devices("deviceId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5359 (class 2606 OID 54011)
-- Name: rent_contracts rent_contracts_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_contracts
    ADD CONSTRAINT "rent_contracts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5360 (class 2606 OID 54001)
-- Name: rent_contracts rent_contracts_landlordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_contracts
    ADD CONSTRAINT "rent_contracts_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5361 (class 2606 OID 53996)
-- Name: rent_contracts rent_contracts_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_contracts
    ADD CONSTRAINT "rent_contracts_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5362 (class 2606 OID 54006)
-- Name: rent_contracts rent_contracts_tenantId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_contracts
    ADD CONSTRAINT "rent_contracts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5357 (class 2606 OID 53986)
-- Name: rent_payments rent_payments_contractId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT "rent_payments_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES public.rent_contracts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5358 (class 2606 OID 53991)
-- Name: rent_payments rent_payments_receivedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rent_payments
    ADD CONSTRAINT "rent_payments_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES public.market_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5306 (class 2606 OID 53736)
-- Name: role_permissions role_permissions_grantedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5307 (class 2606 OID 53731)
-- Name: role_permissions role_permissions_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT "role_permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5331 (class 2606 OID 53861)
-- Name: sale_items sale_items_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5332 (class 2606 OID 53856)
-- Name: sale_items sale_items_saleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES public.sales(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5328 (class 2606 OID 53851)
-- Name: sales sales_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5329 (class 2606 OID 53846)
-- Name: sales sales_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5330 (class 2606 OID 53841)
-- Name: sales sales_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT "sales_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5350 (class 2606 OID 53956)
-- Name: scanner_devices scanner_devices_gateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scanner_devices
    ADD CONSTRAINT "scanner_devices_gateId_fkey" FOREIGN KEY ("gateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5351 (class 2606 OID 53951)
-- Name: scanner_devices scanner_devices_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scanner_devices
    ADD CONSTRAINT "scanner_devices_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5352 (class 2606 OID 53961)
-- Name: scanner_devices scanner_devices_registeredById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scanner_devices
    ADD CONSTRAINT "scanner_devices_registeredById_fkey" FOREIGN KEY ("registeredById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5389 (class 2606 OID 54151)
-- Name: shop_assets shop_assets_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_assets
    ADD CONSTRAINT "shop_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5390 (class 2606 OID 54146)
-- Name: shop_assets shop_assets_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shop_assets
    ADD CONSTRAINT "shop_assets_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5246 (class 2606 OID 53456)
-- Name: shops shops_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5247 (class 2606 OID 53436)
-- Name: shops shops_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public.market_levels(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5248 (class 2606 OID 53431)
-- Name: shops shops_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5249 (class 2606 OID 53451)
-- Name: shops shops_marketMasterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_marketMasterId_fkey" FOREIGN KEY ("marketMasterId") REFERENCES public.market_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5250 (class 2606 OID 53446)
-- Name: shops shops_memberId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES public.members(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5251 (class 2606 OID 53441)
-- Name: shops shops_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT "shops_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.market_sections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5235 (class 2606 OID 53381)
-- Name: stakeholders stakeholders_kycVerifiedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT "stakeholders_kycVerifiedByAdminId_fkey" FOREIGN KEY ("kycVerifiedByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5236 (class 2606 OID 53376)
-- Name: stakeholders stakeholders_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT "stakeholders_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5391 (class 2606 OID 54161)
-- Name: stall_assets stall_assets_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stall_assets
    ADD CONSTRAINT "stall_assets_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5392 (class 2606 OID 54156)
-- Name: stall_assets stall_assets_stallId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stall_assets
    ADD CONSTRAINT "stall_assets_stallId_fkey" FOREIGN KEY ("stallId") REFERENCES public.stalls(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5252 (class 2606 OID 53476)
-- Name: stalls stalls_aisleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_aisleId_fkey" FOREIGN KEY ("aisleId") REFERENCES public.market_aisles(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5253 (class 2606 OID 53496)
-- Name: stalls stalls_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5254 (class 2606 OID 53491)
-- Name: stalls stalls_levelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES public.market_levels(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5255 (class 2606 OID 53486)
-- Name: stalls stalls_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5256 (class 2606 OID 53481)
-- Name: stalls stalls_marketMasterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_marketMasterId_fkey" FOREIGN KEY ("marketMasterId") REFERENCES public.market_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5257 (class 2606 OID 53471)
-- Name: stalls stalls_sectionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES public.market_sections(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5258 (class 2606 OID 53461)
-- Name: stalls stalls_shopId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES public.shops(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5259 (class 2606 OID 53466)
-- Name: stalls stalls_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stalls
    ADD CONSTRAINT "stalls_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5338 (class 2606 OID 53901)
-- Name: stock_movements stock_movements_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5339 (class 2606 OID 53896)
-- Name: stock_movements stock_movements_inspectedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_inspectedById_fkey" FOREIGN KEY ("inspectedById") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5340 (class 2606 OID 53891)
-- Name: stock_movements stock_movements_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT "stock_movements_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5262 (class 2606 OID 53511)
-- Name: super_admins super_admins_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.super_admins
    ADD CONSTRAINT "super_admins_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5372 (class 2606 OID 54066)
-- Name: supplier_invoices supplier_invoices_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_invoices
    ADD CONSTRAINT "supplier_invoices_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5373 (class 2606 OID 54061)
-- Name: supplier_invoices supplier_invoices_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.supplier_invoices
    ADD CONSTRAINT "supplier_invoices_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5242 (class 2606 OID 53411)
-- Name: suppliers suppliers_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT "suppliers_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5341 (class 2606 OID 53916)
-- Name: tax_payments tax_payments_collectedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_payments
    ADD CONSTRAINT "tax_payments_collectedById_fkey" FOREIGN KEY ("collectedById") REFERENCES public.pseudo_market_admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5342 (class 2606 OID 53921)
-- Name: tax_payments tax_payments_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_payments
    ADD CONSTRAINT "tax_payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5343 (class 2606 OID 53906)
-- Name: tax_payments tax_payments_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_payments
    ADD CONSTRAINT "tax_payments_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5344 (class 2606 OID 53911)
-- Name: tax_payments tax_payments_vendorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tax_payments
    ADD CONSTRAINT "tax_payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES public.vendors(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5347 (class 2606 OID 53941)
-- Name: token_generation_configs token_generation_configs_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_generation_configs
    ADD CONSTRAINT "token_generation_configs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5348 (class 2606 OID 53936)
-- Name: token_generation_configs token_generation_configs_marketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_generation_configs
    ADD CONSTRAINT "token_generation_configs_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5285 (class 2606 OID 53646)
-- Name: token_usage_logs token_usage_logs_scannerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT "token_usage_logs_scannerId_fkey" FOREIGN KEY ("scannerId") REFERENCES public.scanner_devices("deviceId") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5286 (class 2606 OID 53626)
-- Name: token_usage_logs token_usage_logs_tokenId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT "token_usage_logs_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES public.market_tokens(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5287 (class 2606 OID 53641)
-- Name: token_usage_logs token_usage_logs_usedAtGateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT "token_usage_logs_usedAtGateId_fkey" FOREIGN KEY ("usedAtGateId") REFERENCES public.market_gates(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5288 (class 2606 OID 53636)
-- Name: token_usage_logs token_usage_logs_usedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT "token_usage_logs_usedByAdminId_fkey" FOREIGN KEY ("usedByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5289 (class 2606 OID 53631)
-- Name: token_usage_logs token_usage_logs_usedByUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.token_usage_logs
    ADD CONSTRAINT "token_usage_logs_usedByUserId_fkey" FOREIGN KEY ("usedByUserId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5327 (class 2606 OID 53836)
-- Name: transactions transactions_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT "transactions_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5219 (class 2606 OID 53296)
-- Name: user_profiles user_profiles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5220 (class 2606 OID 53301)
-- Name: user_profiles user_profiles_verifiedByAdminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT "user_profiles_verifiedByAdminId_fkey" FOREIGN KEY ("verifiedByAdminId") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5303 (class 2606 OID 53726)
-- Name: user_roles user_roles_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public.admins(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5304 (class 2606 OID 53721)
-- Name: user_roles user_roles_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public.roles(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5305 (class 2606 OID 53716)
-- Name: user_roles user_roles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5222 (class 2606 OID 53311)
-- Name: user_sessions user_sessions_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5239 (class 2606 OID 53406)
-- Name: vendors vendors_marketMasterApprovalId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_marketMasterApprovalId_fkey" FOREIGN KEY ("marketMasterApprovalId") REFERENCES public.market_masters(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5240 (class 2606 OID 53401)
-- Name: vendors vendors_primaryMarketId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_primaryMarketId_fkey" FOREIGN KEY ("primaryMarketId") REFERENCES public.markets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5241 (class 2606 OID 53396)
-- Name: vendors vendors_stakeholderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendors
    ADD CONSTRAINT "vendors_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES public.stakeholders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5221 (class 2606 OID 53306)
-- Name: verification_tokens verification_tokens_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.verification_tokens
    ADD CONSTRAINT "verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5617 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-02-09 17:14:47

--
-- PostgreSQL database dump complete
--

\unrestrict T7l8hYDdo2JH9TOSUWhKJSeKjxPci7UnyfVkgu70e3hxw6VKs77kiHxFiG4z1Bm

