#!/bin/bash
# MarketMaster API: Automated Environment Setup & Launch

echo "--- Starting MarketMaster API Setup ---"

# 1. Install Dependencies
echo "[1/5] Installing npm dependencies..."
npm install

# 2. Sync Database Schema
echo "[2/5] Pushing database schema (Prisma)..."
npx prisma db push

# 3. Generate Prisma Client
echo "[3/5] Generating Prisma client..."
npx prisma generate

# 4. Seed Initial Data
echo "[4/5] Seeding database..."
npx prisma db seed

# 5. Start Development Server
echo "[5/5] Launching development server..."
npm run dev
