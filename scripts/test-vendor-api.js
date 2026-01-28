// scripts/test-vendor-api.js
/**
 * Test script for SuperAdmin Vendor API
 * 
 * This script demonstrates how to test the vendor API endpoint
 * Run: node scripts/test-vendor-api.js
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = process.env.APP_URL || 'http://localhost:5000';

// Test configuration
const SUPERADMIN_EMAIL = 'superadmin@mms.ug'; // Update with your SuperAdmin email
const SUPERADMIN_PASSWORD = 'your-password'; // Update with your SuperAdmin password

let accessToken = '';

/**
 * Login as SuperAdmin
 */
async function login() {
    try {
        console.log('\n🔐 Logging in as SuperAdmin...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: SUPERADMIN_EMAIL,
            password: SUPERADMIN_PASSWORD
        });

        if (response.data.success) {
            accessToken = response.data.data.accessToken;
            console.log('✅ Login successful');
            console.log(`   User: ${response.data.data.user.email}`);
            console.log(`   Role: ${response.data.data.user.role}`);
            return true;
        }
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data?.message || error.message);
        return false;
    }
}

/**
 * Test 1: Get all vendors (basic)
 */
async function testGetAllVendors() {
    try {
        console.log('\n📋 Test 1: Get all vendors (basic)...');
        const response = await axios.get(`${BASE_URL}/api/superadmin/vendors`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Request successful');
            console.log(`   Total vendors: ${response.data.data.pagination.totalCount}`);
            console.log(`   Current page: ${response.data.data.pagination.currentPage}`);
            console.log(`   Total pages: ${response.data.data.pagination.totalPages}`);
            console.log(`   Vendors on this page: ${response.data.data.vendors.length}`);

            if (response.data.data.vendors.length > 0) {
                const vendor = response.data.data.vendors[0];
                console.log('\n   Sample vendor:');
                console.log(`   - Code: ${vendor.vendorCode}`);
                console.log(`   - Business: ${vendor.businessName}`);
                console.log(`   - Email: ${vendor.stakeholder.user.email}`);
                console.log(`   - KYC Status: ${vendor.stakeholder.kycStatus}`);
                console.log(`   - Total Stalls: ${vendor.stats.totalStalls}`);
            }
        }
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

/**
 * Test 2: Pagination
 */
async function testPagination() {
    try {
        console.log('\n📄 Test 2: Pagination (page 1, limit 5)...');
        const response = await axios.get(`${BASE_URL}/api/superadmin/vendors`, {
            params: {
                page: 1,
                limit: 5
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Request successful');
            console.log(`   Vendors returned: ${response.data.data.vendors.length}`);
            console.log(`   Has next page: ${response.data.data.pagination.hasNext}`);
            console.log(`   Has previous page: ${response.data.data.pagination.hasPrev}`);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

/**
 * Test 3: Search functionality
 */
async function testSearch() {
    try {
        console.log('\n🔍 Test 3: Search functionality...');
        const response = await axios.get(`${BASE_URL}/api/superadmin/vendors`, {
            params: {
                search: 'VND'
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Request successful');
            console.log(`   Vendors found: ${response.data.data.vendors.length}`);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

/**
 * Test 4: Filter by KYC status
 */
async function testKycFilter() {
    try {
        console.log('\n🔒 Test 4: Filter by KYC status (VERIFIED)...');
        const response = await axios.get(`${BASE_URL}/api/superadmin/vendors`, {
            params: {
                kycStatus: 'VERIFIED'
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Request successful');
            console.log(`   Verified vendors: ${response.data.data.vendors.length}`);
        }
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

/**
 * Test 5: Sorting
 */
async function testSorting() {
    try {
        console.log('\n📊 Test 5: Sorting (by businessName, ascending)...');
        const response = await axios.get(`${BASE_URL}/api/superadmin/vendors`, {
            params: {
                sortBy: 'businessName',
                order: 'asc',
                limit: 5
            },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.data.success) {
            console.log('✅ Request successful');
            console.log('   First 5 vendors (sorted):');
            response.data.data.vendors.forEach((vendor, index) => {
                console.log(`   ${index + 1}. ${vendor.businessName}`);
            });
        }
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data?.message || error.message);
    }
}

/**
 * Test 6: Unauthorized access (without token)
 */
async function testUnauthorized() {
    try {
        console.log('\n🚫 Test 6: Unauthorized access (no token)...');
        await axios.get(`${BASE_URL}/api/superadmin/vendors`);
        console.log('❌ Test failed: Should have been rejected');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Correctly rejected with 401 Unauthorized');
        } else {
            console.error('❌ Unexpected error:', error.message);
        }
    }
}

/**
 * Run all tests
 */
async function runTests() {
    console.log('='.repeat(60));
    console.log('SuperAdmin Vendor API Test Suite');
    console.log('='.repeat(60));

    // Login first
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.log('\n❌ Cannot proceed without successful login');
        return;
    }

    // Run tests
    await testGetAllVendors();
    await testPagination();
    await testSearch();
    await testKycFilter();
    await testSorting();
    await testUnauthorized();

    console.log('\n' + '='.repeat(60));
    console.log('Test suite completed');
    console.log('='.repeat(60) + '\n');
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };
