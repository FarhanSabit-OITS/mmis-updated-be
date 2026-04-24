const fs = require('fs');

const collectionPath = 'c:/Users/NEPTUNE TECH/OneDrive/Desktop/UGANDA MMIS REPOS/MarketMasterApi/Data/Market Master Api.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Add Supplier Onboarding folder
collection.item.push({
    name: "Supplier Onboarding",
    item: [
        {
            name: "Setup Supplier Profile (With TIN Upload)",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "formdata",
                    formdata: [
                        { key: "marketId", value: "{{marketId}}", type: "text" },
                        { key: "businessName", value: "Global Supplies Ltd", type: "text" },
                        { key: "businessType", value: "WHOLESALE", type: "text" },
                        { key: "taxIdNumber", value: "200XXXXXXXX", type: "text" },
                        { key: "tinDocument", type: "file", src: "" }
                    ]
                },
                url: {
                    raw: "{{baseURL}}/api/suppliers/setup-profile",
                    host: ["{{baseURL}}"],
                    path: ["api", "suppliers", "setup-profile"]
                }
            }
        }
    ]
});

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated with Supplier Onboarding!');
