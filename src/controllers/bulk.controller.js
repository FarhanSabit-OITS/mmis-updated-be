const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { validateEmail } = require('../utils/validation');
const { notify } = require('../services/notification.service');
const xlsx = require('xlsx');
const { parse } = require('csv-parse/sync');

const prisma = new PrismaClient();

/**
 * Parsing Helper
 */
const parseIncomingFile = (file) => {
    const fileExt = file.name.split('.').pop().toLowerCase();
    
    if (fileExt === 'csv') {
        const content = file.data.toString();
        return parse(content, { columns: true, skip_empty_lines: true });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        const workbook = xlsx.read(file.data);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(sheet);
    }
    throw new Error('Unsupported file format. Please upload CSV or XLSX.');
};

/**
 * Dynamic Field Mapper
 * Maps incoming row keys to target schema keys based on user-provided mapping
 */
const mapRow = (row, fieldMap) => {
    if (!fieldMap) return row;
    const mapped = {};
    Object.entries(fieldMap).forEach(([targetKey, sourceKey]) => {
        mapped[targetKey] = row[sourceKey];
    });
    return mapped;
};

/**
 * Bulk Upload Users
 */
exports.bulkUploadUsers = async (req, res) => {
    let users = req.body.users;
    const fieldMap = req.body.fieldMap ? JSON.parse(req.body.fieldMap) : null;

    // Handle File Upload
    if (req.files && req.files.file) {
        try {
            users = parseIncomingFile(req.files.file);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid payload: no user data found' });
    }

    if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid payload: users must be a non-empty array' });
    }

    const results = {
        success: [],
        failed: []
    };

    try {
        // We process in a transaction to ensure database consistency per batch
        // but we might want to continue on individual failures depending on requirements.
        // For mass ingestion, we'll use a loop but wrap each in a try-catch for granular reporting.
        
        for (const rawRow of users) {
             try {
                const userData = mapRow(rawRow, fieldMap);
                const { email, firstName, lastName, phone, roleName = 'Guest' } = userData;

                if (!validateEmail(email)) {
                    results.failed.push({ email, error: 'Invalid email format' });
                    continue;
                }

                // Check if user exists
                const existing = await prisma.user.findUnique({ where: { email } });
                if (existing) {
                    results.failed.push({ email, error: 'User already exists' });
                    continue;
                }

                // Create user with transaction
                const newUser = await prisma.$transaction(async (tx) => {
                    const createdUser = await tx.user.create({
                        data: {
                            email: email.toLowerCase(),
                            passwordHash: await bcrypt.hash('MarketMaster2024!', 10), // Default password
                            phone,
                            status: 'ACTIVE',
                            profile: {
                                create: {
                                    firstName,
                                    lastName
                                }
                            }
                        }
                    });

                    // Assign role if roleName provided
                    const role = await tx.role.findFirst({ where: { name: roleName } });
                    if (role) {
                        await tx.userRole.create({
                            data: {
                                userId: createdUser.id,
                                roleId: role.id
                            }
                        });
                    }

                    return createdUser;
                });

                results.success.push({ email: newUser.email, id: newUser.id });
                
                // Send notification
                await notify({
                    userId: newUser.id,
                    title: 'Welcome to MarketMaster',
                    message: 'Your account has been created via bulk upload. Please update your password.',
                    type: 'SUCCESS'
                });

            } catch (err) {
                results.failed.push({ 
                    email: userData.email || 'unknown', 
                    error: err.message 
                });
            }
        }

        return res.status(200).json({
            success: true,
            summary: {
                total: users.length,
                success: results.success.length,
                failed: results.failed.length
            },
            results
        });

    } catch (error) {
        console.error('[BulkController] Fatal error in bulk upload:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during bulk processing' });
    }
};

/**
 * Bulk Upload Vendors
 */
exports.bulkUploadVendors = async (req, res) => {
    const fieldMap = req.body.fieldMap ? JSON.parse(req.body.fieldMap) : null;

    // Handle File Upload
    if (req.files && req.files.file) {
        try {
            vendors = parseIncomingFile(req.files.file);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    if (!Array.isArray(vendors) || vendors.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid payload: no vendor data found' });
    }

    const results = {
        success: [],
        failed: []
    };

    for (const rawRow of vendors) {
        try {
            const vendorData = mapRow(rawRow, fieldMap);
            const { 
                businessName, 
                ownerName, 
                email, 
                phone, 
                category, 
                marketId,
                tinNumber
            } = vendorData;

            // Validate market exists
            const market = await prisma.market.findUnique({ where: { id: marketId } });
            if (!market) {
                results.failed.push({ businessName, error: `Market with ID ${marketId} not found` });
                continue;
            }

            const newVendor = await prisma.vendor.create({
                data: {
                    businessName,
                    ownerName,
                    email,
                    phone,
                    category,
                    marketId,
                    tinNumber,
                    status: 'ACTIVE'
                }
            });

            results.success.push({ businessName: newVendor.businessName, id: newVendor.id });
        } catch (err) {
            results.failed.push({ 
                businessName: vendorData.businessName || 'unknown', 
                error: err.message 
            });
        }
    }

    return res.status(200).json({
        success: true,
        summary: {
            total: vendors.length,
            success: results.success.length,
            failed: results.failed.length
        },
        results
    });
};

/**
 * Bulk Upload Facilities (Shops)
 */
exports.bulkUploadFacilities = async (req, res) => {
    const fieldMap = req.body.fieldMap ? JSON.parse(req.body.fieldMap) : null;

    // Handle File Upload
    if (req.files && req.files.file) {
        try {
            facilities = parseIncomingFile(req.files.file);
        } catch (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
    }

    if (!Array.isArray(facilities) || facilities.length === 0) {
        return res.status(400).json({ success: false, message: 'Invalid payload: no facility data found' });
    }

    const results = {
        success: [],
        failed: []
    };

    for (const rawRow of facilities) {
        try {
            const facilityData = mapRow(rawRow, fieldMap);
            const { 
                name, 
                type, 
                marketId, 
                levelId, 
                sectionId,
                rentAmount,
                createdById
            } = facilityData;

            const newFacility = await prisma.facility.create({
                data: {
                    name,
                    type,
                    marketId,
                    levelId,
                    sectionId,
                    status: 'AVAILABLE',
                    rentAmount: rentAmount ? parseFloat(rentAmount) : 0,
                    createdById
                }
            });

            results.success.push({ name: newFacility.name, id: newFacility.id });
        } catch (err) {
            results.failed.push({ 
                name: facilityData.name || 'unknown', 
                error: err.message 
            });
        }
    }

    return res.status(200).json({
        success: true,
        summary: {
            total: facilities.length,
            success: results.success.length,
            failed: results.failed.length
        },
        results
    });
};
