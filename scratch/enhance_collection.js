const fs = require('fs');
const path = require('path');

const collectionPath = 'c:/Users/NEPTUNE TECH/OneDrive/Desktop/UGANDA MMIS REPOS/MarketMasterApi/Data/Market Master Api.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// 1. Add Gate Terminal Folder
const gateFolder = {
    name: "Gate Terminal",
    item: [
        {
            name: "Get Fees",
            request: {
                method: "GET",
                header: [],
                url: {
                    raw: "{{baseURL}}/api/gate/fees?category=TRUCK",
                    host: ["{{baseURL}}"],
                    path: ["api", "gate", "fees"],
                    query: [{ key: "category", value: "TRUCK" }]
                }
            }
        },
        {
            name: "Create Entry Token",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "raw",
                    raw: JSON.stringify({
                        plate: "UAB 123X",
                        category: "CAR",
                        paymentRef: "PAY-998877"
                    }, null, 4),
                    options: { raw: { language: "json" } }
                },
                url: {
                    raw: "{{baseURL}}/api/gate/entry",
                    host: ["{{baseURL}}"],
                    path: ["api", "gate", "entry"]
                }
            }
        },
        {
            name: "Scan for Exit",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "raw",
                    raw: JSON.stringify({ tokenCode: "G-ABC123" }, null, 4),
                    options: { raw: { language: "json" } }
                },
                url: {
                    raw: "{{baseURL}}/api/gate/scan-exit",
                    host: ["{{baseURL}}"],
                    path: ["api", "gate", "scan-exit"]
                }
            }
        },
        {
            name: "Process Exit",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "raw",
                    raw: JSON.stringify({ tokenCode: "G-ABC123" }, null, 4),
                    options: { raw: { language: "json" } }
                },
                url: {
                    raw: "{{baseURL}}/api/gate/exit",
                    host: ["{{baseURL}}"],
                    path: ["api", "gate", "exit"]
                }
            }
        }
    ]
};

// 2. Add KYC Folder
const kycFolder = {
    name: "KYC Compliance",
    item: [
        {
            name: "Submit KYC",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "raw",
                    raw: JSON.stringify({
                        nationalId: "CM1234567890",
                        nationalIdType: "NIN",
                        residentialAddress: "123 Market St, Kampala",
                        businessType: "RETAIL"
                    }, null, 4),
                    options: { raw: { language: "json" } }
                },
                url: {
                    raw: "{{baseURL}}/api/kyc/submit",
                    host: ["{{baseURL}}"],
                    path: ["api", "kyc", "submit"]
                }
            }
        },
        {
            name: "Get KYC Status",
            request: {
                method: "GET",
                header: [],
                url: {
                    raw: "{{baseURL}}/api/kyc/status",
                    host: ["{{baseURL}}"],
                    path: ["api", "kyc", "status"]
                }
            }
        }
    ]
};

// 3. Add Financials Folder
const financialsFolder = {
    name: "Financials",
    item: [
        {
            name: "Process General Payment",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "raw",
                    raw: JSON.stringify({
                        amount: 5000,
                        method: "MOBILE_MONEY",
                        description: "Daily market fee",
                        taxAmount: 900
                    }, null, 4),
                    options: { raw: { language: "json" } }
                },
                url: {
                    raw: "{{baseURL}}/api/financials/pay",
                    host: ["{{baseURL}}"],
                    path: ["api", "financials", "pay"]
                }
            }
        }
    ]
};

// Push to items
collection.item.push(gateFolder);
collection.item.push(kycFolder);
collection.item.push(financialsFolder);

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection enhanced successfully!');
