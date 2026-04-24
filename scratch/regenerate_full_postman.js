const fs = require('fs');
const path = require('path');

const collectionPath = 'c:/Users/NEPTUNE TECH/OneDrive/Desktop/UGANDA MMIS REPOS/MarketMasterApi/Data/Market Master Api.postman_collection.json';
let collection;

try {
    collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
} catch (e) {
    // If it fails, we'll create a skeleton
    collection = {
        info: {
            name: "Market Master API - Hardened v2",
            schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        item: []
    };
}

// Add/Update Folders
const getFolder = (name) => {
    let folder = collection.item.find(i => i.name === name);
    if (!folder) {
        folder = { name, item: [] };
        collection.item.push(folder);
    }
    return folder;
};

const authFolder = getFolder("Authentication");
const onboardingFolder = getFolder("Onboarding & KYC");
const gateFolder = getFolder("Gate Terminal");

// Update Login Request
const loginReq = {
    name: "Login (Hardened)",
    request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
            mode: "raw",
            raw: JSON.stringify({ email: "vendor@example.com", password: "password123" }, null, 2)
        },
        url: { raw: "{{base_url}}/auth/login", host: ["{{base_url}}"], path: ["auth", "login"] },
        description: "Returns needsOnboarding flag. If true, redirect user to Onboarding."
    }
};
authFolder.item.push(loginReq);

// Onboarding Requests
const setupShopReq = {
    name: "Setup Shop (Multipart TIN Upload)",
    request: {
        method: "POST",
        header: [],
        body: {
            mode: "formdata",
            formdata: [
                { key: "marketId", value: "{{market_id}}", type: "text" },
                { key: "shopName", value: "My Hardened Shop", type: "text" },
                { key: "taxIdNumber", value: "1234567890", type: "text" },
                { key: "tinDocument", type: "file", src: "" },
                { key: "bankName", value: "Standard Chartered", type: "text" },
                { key: "bankAccountNumber", value: "123456789", type: "text" },
                { key: "mobileMoneyNumber", value: "256770000000", type: "text" },
                { key: "mobileMoneyNetwork", value: "MTN", type: "text" }
            ]
        },
        url: { raw: "{{base_url}}/vendors/setup-shop", host: ["{{base_url}}"], path: ["vendors", "setup-shop"] }
    }
};
onboardingFolder.item.push(setupShopReq);

const setupSupplierReq = {
    name: "Setup Supplier Profile (Hardened)",
    request: {
        method: "POST",
        header: [],
        body: {
            mode: "formdata",
            formdata: [
                { key: "businessName", value: "Bulk Agro Suppliers Ltd", type: "text" },
                { key: "businessType", value: "WHOLESALE", type: "text" },
                { key: "taxIdNumber", value: "9876543210", type: "text" },
                { key: "tinDocument", type: "file", src: "" },
                { key: "mobileMoneyNumber", value: "256780000000", type: "text" },
                { key: "mobileMoneyNetwork", value: "AIRTEL", type: "text" }
            ]
        },
        url: { raw: "{{base_url}}/vendors/setup-profile", host: ["{{base_url}}"], path: ["vendors", "setup-profile"] }
    }
};
onboardingFolder.item.push(setupSupplierReq);

// Gate Requests
const gateEntryReq = {
    name: "Gate Entry (Generate Token)",
    request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
            mode: "raw",
            raw: JSON.stringify({ plate: "UBA 123A", category: "TRUCK", paymentRef: "PAY-123", marketId: "{{market_id}}" }, null, 2)
        },
        url: { raw: "{{base_url}}/gate/entry", host: ["{{base_url}}"], path: ["gate", "entry"] },
        description: "Returns tokenCode, shortCode, and qrPayload."
    }
};
gateFolder.item.push(gateEntryReq);

const scanExitReq = {
    name: "Scan for Exit (Lookup by Code/ShortCode)",
    request: {
        method: "POST",
        header: [{ key: "Content-Type", value: "application/json" }],
        body: {
            mode: "raw",
            raw: JSON.stringify({ tokenCode: "G-A1B2C3" }, null, 2)
        },
        url: { raw: "{{base_url}}/gate/scan-exit", host: ["{{base_url}}"], path: ["gate", "scan-exit"] },
        description: "Checks duration and overstay fees."
    }
};
gateFolder.item.push(scanExitReq);

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection fully updated and hardened!');
