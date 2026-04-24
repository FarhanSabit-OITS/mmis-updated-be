const fs = require('fs');
const path = require('path');

const collectionPath = path.join(__dirname, '../Data/Market Master Api.postman_collection.json');
const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));

// Helper to find and update formdata
const updateFormData = (requestName, newFields) => {
    collection.item.forEach(folder => {
        if (folder.item) {
            folder.item.forEach(req => {
                if (req.name === requestName && req.request.body && req.request.body.formdata) {
                    newFields.forEach(field => {
                        // Avoid duplicates
                        if (!req.request.body.formdata.find(f => f.key === field.key)) {
                            req.request.body.formdata.push(field);
                        }
                    });
                }
            });
        }
    });
};

const paymentFields = [
    { key: "bankName", value: "Standard Chartered", type: "text" },
    { key: "bankAccountNumber", value: "123456789", type: "text" },
    { key: "mobileMoneyNumber", value: "256770000000", type: "text" },
    { key: "mobileMoneyNetwork", value: "MTN", type: "text" }
];

updateFormData("Setup Shop (With TIN Upload)", paymentFields);
updateFormData("Setup Supplier Profile (With TIN Upload)", paymentFields);

fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2));
console.log('Postman collection updated with payment fields!');
