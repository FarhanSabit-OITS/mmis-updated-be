#!/usr/bin/env pwsh
# =============================================================================
#  MarketMaster ERP — Bootstrap & Sequential Seed Script
#  Run from: c:\Users\NEPTUNE TECH\OneDrive\Desktop\UGANDA MMIS REPOS\MarketMasterApi
#  Usage:    .\scripts\bootstrap.ps1 [-SkipInstall] [-SkipSeed] [-ResetDb]
# =============================================================================

param(
    [switch]$SkipInstall,   # Skip pnpm install (use when deps already installed)
    [switch]$SkipSeed,      # Skip seeding (start server only)
    [switch]$ResetDb,       # WARNING: Drops & recreates the entire DB before seeding
    [switch]$SeedOnly       # Run seed only, do not start the server
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir   = Split-Path -Parent $ScriptDir

Set-Location $RootDir

# == Helpers =================================================================
function Write-Step   { param($msg) Write-Host "`n[STEP] $msg" -ForegroundColor Cyan }
function Write-OK     { param($msg) Write-Host "   [OK]   $msg" -ForegroundColor Green }
function Write-Warn   { param($msg) Write-Host "   [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail   { param($msg) Write-Host "   [FAIL] $msg" -ForegroundColor Red }
function Assert-EnvVar {
    param($Name, $ExampleValue)
    $val = [System.Environment]::GetEnvironmentVariable($Name)
    if (-not $val -or $val -eq $ExampleValue) {
        Write-Warn "[$Name] is using a placeholder or is missing. Update .env before production!"
    } else {
        Write-OK "$Name is set."
    }
}

# == Banner ===================================================================
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host "   MarketMaster ERP - Bootstrap & Seed Script            " -ForegroundColor Magenta
Write-Host "   Uganda Market Management Information System (MMIS)    " -ForegroundColor Magenta
Write-Host "=========================================================" -ForegroundColor Magenta
Write-Host ""

# ────────────────────────────────────────────────────────────────────────────
# STEP 0: Environment Check
# ────────────────────────────────────────────────────────────────────────────
Write-Step "0. Environment Validation"

if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Warn ".env not found. Copying from .env.example — update values before proceeding!"
        Copy-Item ".env.example" ".env"
    } else {
        Write-Fail ".env file is missing and no .env.example found. Aborting."
        exit 1
    }
}

# Load .env into current process
Get-Content ".env" | ForEach-Object {
    if ($_ -match "^\s*([^#][^=]*)=(.*)$") {
        $key   = $Matches[1].Trim()
        $value = $Matches[2].Trim().Trim('"')
        [System.Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}
Write-OK ".env loaded into current process."

# Warn about placeholder values
Assert-EnvVar "JWT_SECRET"    "your-super-secret-jwt-key"
Assert-EnvVar "DATABASE_URL"  ""
Assert-EnvVar "SMTP_USER"     "your_email@gmail.com"
Assert-EnvVar "GEMINI_API_KEY" ""

# Check for Data/ directory (vendor registry Excel files)
if (-not (Test-Path "Data")) {
    Write-Warn "Data/ directory not found. Vendor registry import will be skipped by the seed."
    Write-Warn "Place .xlsx vendor registry files in Data/ to seed vendor data."
} else {
    $xlsxCount = (Get-ChildItem "Data" -Filter "*.xlsx").Count
    Write-OK "Data/ directory found with $xlsxCount .xlsx file(s)."
}

# ────────────────────────────────────────────────────────────────────────────
# STEP 1: Install Dependencies
# ────────────────────────────────────────────────────────────────────────────
if (-not $SkipInstall) {
    Write-Step "1. Installing Dependencies (pnpm install)"
    try {
        pnpm install --frozen-lockfile 2>&1
        Write-OK "Dependencies installed successfully."
    } catch {
        Write-Warn "pnpm not found, falling back to npm install..."
        npm install 2>&1
        Write-OK "Dependencies installed via npm."
    }
} else {
    Write-Warn "Step 1 skipped (--SkipInstall)."
}

# ────────────────────────────────────────────────────────────────────────────
# STEP 2: Prisma Client Generation
# ────────────────────────────────────────────────────────────────────────────
Write-Step "2. Generating Prisma Client"
npx prisma generate 2>&1
Write-OK "Prisma Client generated."

# ────────────────────────────────────────────────────────────────────────────
# STEP 3: Database Migration
# ────────────────────────────────────────────────────────────────────────────
Write-Step "3. Running Database Migrations"

if ($ResetDb) {
    Write-Warn "--ResetDb flag detected. This will DROP all data and recreate the schema!"
    $confirm = Read-Host "   Type 'yes' to confirm database reset"
    if ($confirm -ne "yes") {
        Write-Fail "Reset aborted by user."
        exit 1
    }
    Write-Host "   Resetting database..." -ForegroundColor Yellow
    npx prisma migrate reset --force 2>&1
    Write-OK "Database reset and all migrations applied."
} else {
    npx prisma migrate deploy 2>&1
    Write-OK "All pending migrations applied."
}

# ────────────────────────────────────────────────────────────────────────────
# STEP 4: Migration Status Check
# ────────────────────────────────────────────────────────────────────────────
Write-Step "4. Migration Status Check"
npx prisma migrate status 2>&1
Write-OK "Migration status check complete."

# ────────────────────────────────────────────────────────────────────────────
# STEP 5: Sequential Database Seeding
# ────────────────────────────────────────────────────────────────────────────
if (-not $SkipSeed) {
    Write-Step "5. Running Sequential Database Seed"
    Write-Host "   Seeding order:" -ForegroundColor Gray
    Write-Host "   [1] Cleanup (all tables truncated in FK-safe order)" -ForegroundColor Gray
    Write-Host "   [2] Roles (SuperAdmin, MarketMaster, GateCounter, RevenueCollector)" -ForegroundColor Gray
    Write-Host "   [3] Geography (Regions → Districts → Cities)" -ForegroundColor Gray
    Write-Host "   [4] System Admins (SuperAdmin, Market Masters x3)" -ForegroundColor Gray
    Write-Host "   [5] Markets (Kabale, Mbarara, Jinja)" -ForegroundColor Gray
    Write-Host "   [6] Market Staff (Pseudo Admins per market)" -ForegroundColor Gray
    Write-Host "   [7] Vendor Registries from Data/*.xlsx (if present)" -ForegroundColor Gray
    Write-Host ""

    npx prisma db seed 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Seeding failed. Check the error above. Common fixes:"
        Write-Fail "  - Run with -ResetDb to clear constraint conflicts"
        Write-Fail "  - Check DATABASE_URL in .env is pointing to the correct DB"
        Write-Fail "  - Ensure Data/*.xlsx files are valid and not open in Excel"
        exit 1
    }
    Write-OK "Database seeded successfully."

    # Print seeded credentials summary
    Write-Host ""
    Write-Host "   ---------------------------------------------------------" -ForegroundColor Green
    Write-Host "                 SEEDED TEST CREDENTIALS                    " -ForegroundColor Green
    Write-Host "   ---------------------------------------------------------" -ForegroundColor Green
    Write-Host "    Role            | Email / Password                      " -ForegroundColor Green
    Write-Host "   ---------------------------------------------------------" -ForegroundColor Green
    Write-Host "    SuperAdmin      | superadmin@mmis.ug / Password@123     " -ForegroundColor Green
    Write-Host "    MM (Kabale)     | master.admin@kabalemarket.ug          " -ForegroundColor Green
    Write-Host "    MM (Jinja)      | master.admin@jinjamarket.ug           " -ForegroundColor Green
    Write-Host "    All passwords   | Password@123                          " -ForegroundColor Green
    Write-Host "   ---------------------------------------------------------" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Warn "Step 5 skipped (--SkipSeed)."
}

# ────────────────────────────────────────────────────────────────────────────
# STEP 6: Optional Kabale Hierarchy Seed
# ────────────────────────────────────────────────────────────────────────────
if (-not $SkipSeed) {
    Write-Step "6. Running Kabale Market Hierarchy Seed (Optional)"
    if (Test-Path "prisma/seed_kabale_hierarchy.ts") {
        Write-Host "   Running seed_kabale_hierarchy.ts..." -ForegroundColor Gray
        npx ts-node prisma/seed_kabale_hierarchy.ts 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-OK "Kabale hierarchy seeded (Levels, Sections, Gates)."
        } else {
            Write-Warn "Kabale hierarchy seed failed (non-critical). Check output above."
        }
    } else {
        Write-Warn "prisma/seed_kabale_hierarchy.ts not found, skipping."
    }
}

# ────────────────────────────────────────────────────────────────────────────
# STEP 7: Start Dev Server
# ────────────────────────────────────────────────────────────────────────────
if (-not $SeedOnly) {
    Write-Step "7. Starting Development Server"
    $envPort = [System.Environment]::GetEnvironmentVariable('PORT', 'Process'); if (-not $envPort) { $envPort = '5000' }
    $envCors = [System.Environment]::GetEnvironmentVariable('FRONTEND_URL', 'Process'); if (-not $envCors) { $envCors = 'http://localhost:5173' }
    $envNodeEnv = [System.Environment]::GetEnvironmentVariable('NODE_ENV', 'Process'); if (-not $envNodeEnv) { $envNodeEnv = 'development' }
    
    Write-Host "   Port    : $envPort" -ForegroundColor Gray
    Write-Host "   CORS    : $envCors" -ForegroundColor Gray
    Write-Host "   Env     : $envNodeEnv" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Press Ctrl+C to stop the server." -ForegroundColor Yellow
    Write-Host ""

    npm run dev
} else {
    Write-OK "SeedOnly mode: Server not started."
    Write-OK "[*] Bootstrap complete! Run 'npm run dev' to start the server."
}
