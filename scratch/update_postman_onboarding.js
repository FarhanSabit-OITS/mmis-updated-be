const fs = require('fs');

const collectionPath = 'c:/Users/NEPTUNE TECH/OneDrive/Desktop/UGANDA MMIS REPOS/MarketMasterApi/Data/Market Master Api.postman_collection.json';
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Find "setup-shop" and update to formdata
collection.item.forEach(folder => {
    if (folder.name === "Vendor_Product_Management" || folder.name === "Vendor_Management") {
        folder.item.forEach(req => {
            if (req.name === "Setup Shop" || (req.request && req.request.url.path && req.request.url.path.includes("setup-shop"))) {
                req.request.body = {
                    mode: "formdata",
                    formdata: [
                        { key: "marketId", value: "m1", type: "text" },
                        { key: "shopName", value: "Green Grocers", type: "text" },
                        { key: "stallNumber", value: "G-101", type: "text" },
                        { key: "monthlyRent", value: "250000", type: "text" },
                        { key: "taxIdNumber", value: "1002233445", type: "text" },
                        { key: "tinDocument", type: "file", src: "" }
                    ]
                };
            }
        });
    }
});

// Update setup-shop in the new structure if it's there
collection.item.forEach(folder => {
    if (folder.name === "Vendor Onboarding") {
        folder.item.push({
            name: "Setup Shop (With TIN Upload)",
            request: {
                method: "POST",
                header: [],
                body: {
                    mode: "formdata",
                    formdata: [
                        { key: "marketId", value: "{{marketId}}", type: "text" },
                        { key: "shopName", value: "My New Shop", type: "text" },
                        { key: "stallNumber", value: "S-01", type: "text" },
                        { key: "monthlyRent", value: "300000", type: "text" },
                        { key: "taxIdNumber", value: "100XXXXXXXX", type: "text" },
                        { key: "tinDocument", type: "file", src: "" }
                    ]
                },
                url: {
                    raw: "{{baseURL}}/api/vendors/setup-shop",
                    host: ["{{baseURL}}"],
                    path: ["api", "vendors", "setup-shop"]
                }
            }
        });
    }
});

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated with multipart/form-data for setup-shop!');
