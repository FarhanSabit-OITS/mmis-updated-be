const vendorService = require('../src/services/vendor.service');

async function testVendorOps() {
    try {
        console.log('--- Testing Vendor Operations (Service Layer) ---');

        // 1. Create a test vendor
        console.log('\nCreating a test vendor...');
        const newVendorData = {
            email: `test_vendor_${Date.now()}@example.com`,
            firstName: 'Test',
            lastName: 'Vendor',
            businessName: 'Automated Test Shop',
            businessType: 'RETAIL',
            phone: '123456789'
        };

        const createdVendor = await vendorService.createVendor(newVendorData);
        console.log('Created Vendor ID:', createdVendor.id);
        console.log('Vendor Code:', createdVendor.vendorCode);
        console.log('Email:', createdVendor.stakeholder.user.email);

        // 2. Delete (soft delete) the test vendor
        console.log('\nDeleting the test vendor...');
        const deleteRes = await vendorService.deleteVendor(createdVendor.id);
        console.log('Delete status update for user:', deleteRes.status);
        console.log('Deleted At:', deleteRes.deletedAt);

        console.log('\n--- Test Completed Successfully ---');
        process.exit(0);
    } catch (err) {
        console.error('Test Failed:', err.message);
        process.exit(1);
    }
}

testVendorOps();
