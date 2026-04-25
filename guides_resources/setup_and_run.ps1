# MarketMaster API: Automated Environment Setup & Launch
# This script prepares the database, generates Prisma client, seeds data, and starts the server.

Write-Host "--- Starting MarketMaster API Setup ---" -ForegroundColor Cyan

# 1. Install Dependencies
Write-Host "[1/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install

# 2. Sync Database Schema
Write-Host "[2/5] Pushing database schema (Prisma)..." -ForegroundColor Yellow
npx prisma db push

# 3. Generate Prisma Client
Write-Host "[3/5] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

# 4. Seed Initial Data (Cities, Markets, Admins, Legacy Registry)
Write-Host "[4/5] Seeding database..." -ForegroundColor Yellow
npx prisma db seed

# 5. Start Development Server
Write-Host "[5/5] Launching development server..." -ForegroundColor Green
npm run dev
