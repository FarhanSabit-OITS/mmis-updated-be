/**
 * Document Controller — Extended with KYC submission, PDF generation, and analytics reporting.
 */


const pdfService = require('../services/pdf.service');
const docProcessor = require('../services/docProcessor.service');
const complianceService = require('../services/compliance.service');
const { notify } = require('../services/notification.service');
const prisma = require('../shared/prisma');

// ── 1. EXISTING: Get all documents ───────────────────────────────────────────
exports.getDocuments = async (req, res) => {
    try {
        const { marketId, type, status, stakeholderId, search } = req.query;

        const where = {};
        if (marketId) {
            where.stakeholder = { vendor: { marketId } };
        }
        if (type)            where.documentType        = type;
        if (status)          where.verificationStatus  = status;
        if (stakeholderId)   where.stakeholderId        = stakeholderId;
        if (search) {
            where.fileName = { contains: search, mode: 'insensitive' };
        }

        const documents = await prisma.document.findMany({
            where,
            include: {
                stakeholder: {
                    include: { user: { include: { profile: true } }, vendor: true, supplier: true }
                }
            },
            orderBy: { uploadedAt: 'desc' }
        });

        return res.status(200).json({ success: true, data: documents });
    } catch (error) {
        console.error('[DocumentController] Error fetching documents:', error);
        return res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
    }
};

// ── 2. EXISTING: Verify / Reject a document ───────────────────────────────────
exports.verifyDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, verifiedById, expiryDate } = req.body;

        const updatedDoc = await prisma.document.update({
            where: { id },
            data: {
                verificationStatus: status,
                verificationNotes:  notes,
                verifiedById,
                verificationDate:   new Date(),
                expiryDate: expiryDate ? new Date(expiryDate) : undefined
            }
        });

        // If VERIFIED — notify the document owner
        if (status === 'VERIFIED') {
            const doc = await prisma.document.findUnique({
                where: { id },
                include: { stakeholder: true }
            });
            if (doc?.stakeholder?.userId) {
                await notify({
                    userId:  doc.stakeholder.userId,
                    title:   'Document Verified ✅',
                    message: `Your ${updatedDoc.documentType.replace(/_/g, ' ')} has been verified by a Market Administrator.`,
                    type:    'SUCCESS'
                });
            }
        }

        return res.status(200).json({ success: true, data: updatedDoc });
    } catch (error) {
        console.error('[DocumentController] Error verifying document:', error);
        return res.status(500).json({ success: false, message: 'Failed to update document status' });
    }
};

// ── 3. EXISTING: Compliance Alerts ───────────────────────────────────────────
exports.getComplianceAlerts = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const threshold = new Date();
        threshold.setDate(threshold.getDate() + parseInt(days));

        const alerts = await prisma.document.findMany({
            where: { expiryDate: { lte: threshold }, verificationStatus: 'VERIFIED' },
            include: {
                stakeholder: { include: { user: { include: { profile: true } } } }
            },
            orderBy: { expiryDate: 'asc' }
        });

        return res.status(200).json({ success: true, data: alerts });
    } catch (error) {
        console.error('[DocumentController] Compliance alerts error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch compliance alerts' });
    }
};

// ── 4. NEW: Submit KYC Documents (NID, TIN, BINN) ────────────────────────────
exports.submitKyc = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { nidNumber, tinNumber, binnNumber, documentRefs } = req.body;
        // documentRefs: [{ type: 'ID_PROOF'|'TAX_REGISTRATION'|'BUSINESS_LICENSE', fileUrl, fileName, fileSize, mimeType }]

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Find stakeholder
        const stakeholder = await prisma.stakeholder.findFirst({ where: { userId } });
        if (!stakeholder) {
            return res.status(404).json({ success: false, message: 'Stakeholder profile not found' });
        }

        // Update profile with text ID numbers
        await prisma.userProfile.update({
            where: { userId },
            data: {
                nationalId:   nidNumber   || undefined,
                taxIdNumber:  tinNumber   || undefined,
            }
        });

        // Update vendor BINN / TIN if vendor
        if (binnNumber || tinNumber) {
            await prisma.vendor.updateMany({
                where: { stakeholderId: stakeholder.id },
                data: {
                    businessLicenseNumber: binnNumber || undefined,
                    taxIdNumber: tinNumber || undefined,
                }
            });
        }

        // Create Document records for each uploaded file
        const createdDocs = [];
        if (Array.isArray(documentRefs) && documentRefs.length > 0) {
            for (const docRef of documentRefs) {
                const doc = await prisma.document.create({
                    data: {
                        stakeholderId:      stakeholder.id,
                        documentType:       docRef.type || 'ID_PROOF',
                        fileName:           docRef.fileName || 'document',
                        fileUrl:            docRef.fileUrl  || '',
                        fileSize:           docRef.fileSize || 0,
                        mimeType:           docRef.mimeType || 'application/pdf',
                        verificationStatus: 'PENDING',
                        uploadedById:       userId,
                        metadata: {
                            nidNumber,
                            tinNumber,
                            binnNumber,
                        }
                    }
                });
                createdDocs.push(doc);
            }
        }

        // Create a KYC Submission record
        const submission = await prisma.kycSubmission.create({
            data: {
                stakeholderId: stakeholder.id,
                status:        'PENDING',
                level:         nidNumber && tinNumber && binnNumber ? 'FULL' : 'BASIC',
                submittedDocs: createdDocs.map(d => d.id),
                metadata: { nidNumber, tinNumber, binnNumber }
            }
        });

        // Update stakeholder KYC status
        await prisma.stakeholder.update({
            where: { id: stakeholder.id },
            data: {
                kycStatus:        'PENDING',
                kycSubmittedAt:   new Date(),
            }
        });

        // Notify the user
        await notify({
            userId,
            title:   'KYC Submitted Successfully',
            message: 'Your identity documents have been submitted for review. A Market Administrator will verify within 24 hours.',
            type:    'INFO'
        });

        return res.status(201).json({
            success: true,
            message: 'KYC documents submitted successfully',
            data:    { submission, documents: createdDocs }
        });
    } catch (error) {
        console.error('[DocumentController] KYC submit error:', error);
        return res.status(500).json({ success: false, message: 'Failed to submit KYC documents' });
    }
};

// ── 5. NEW: Get KYC Status for logged-in user ─────────────────────────────────
exports.getMyKycStatus = async (req, res) => {
    try {
        const userId = req.user?.id;
        const stakeholder = await prisma.stakeholder.findFirst({
            where: { userId },
            include: {
                documents: { orderBy: { uploadedAt: 'desc' } },
                kycSubmissions: { orderBy: { submissionDate: 'desc' }, take: 1 }
            }
        });

        if (!stakeholder) {
            return res.status(404).json({ success: false, message: 'Stakeholder not found' });
        }

        return res.status(200).json({
            success: true,
            data: {
                kycStatus:       stakeholder.kycStatus,
                kycSubmittedAt:  stakeholder.kycSubmittedAt,
                kycVerifiedAt:   stakeholder.kycVerifiedAt,
                documents:       stakeholder.documents,
                latestSubmission: stakeholder.kycSubmissions[0] || null
            }
        });
    } catch (error) {
        console.error('[DocumentController] KYC status error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get KYC status' });
    }
};

// ── 6. NEW: Admin — Get Pending KYC Queue ────────────────────────────────────
exports.getKycQueue = async (req, res) => {
    try {
        const { marketId, status = 'PENDING' } = req.query;

        const submissions = await prisma.kycSubmission.findMany({
            where: { status },
            include: {
                stakeholder: {
                    include: {
                        user: { include: { profile: true } },
                        vendor: true,
                        supplier: true,
                        documents: { where: { verificationStatus: 'PENDING' } }
                    }
                }
            },
            orderBy: { submissionDate: 'asc' }
        });

        return res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error('[DocumentController] KYC queue error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch KYC queue' });
    }
};

// ── 7. NEW: Admin — Approve/Reject full KYC Submission ───────────────────────
exports.reviewKycSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { action, notes } = req.body; // action: 'APPROVED' | 'REJECTED'
        const adminId = req.user?.adminId;

        const submission = await prisma.kycSubmission.findUnique({
            where: { id: submissionId },
            include: { stakeholder: true }
        });

        if (!submission) {
            return res.status(404).json({ success: false, message: 'KYC Submission not found' });
        }

        const newStatus = action === 'APPROVED' ? 'VERIFIED' : 'REJECTED';

        // Update submission
        await prisma.kycSubmission.update({
            where: { id: submissionId },
            data: {
                status:         newStatus,
                reviewedById:   adminId || undefined,
                reviewedAt:     new Date(),
                reviewNotes:    notes || undefined,
                rejectionReason: action === 'REJECTED' ? notes : undefined
            }
        });

        // Update all documents in this submission
        await prisma.document.updateMany({
            where: { id: { in: submission.submittedDocs } },
            data: {
                verificationStatus: action === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
                verificationNotes:  notes,
                verifiedById:       adminId || undefined,
                verificationDate:   new Date(),
            }
        });

        // Update stakeholder KYC status
        await prisma.stakeholder.update({
            where: { id: submission.stakeholderId },
            data: {
                kycStatus:           action === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
                kycVerifiedAt:       action === 'APPROVED' ? new Date() : undefined,
                kycVerifiedByAdminId: adminId || undefined,
            }
        });

        // Notify the user
        await notify({
            userId:  submission.stakeholder.userId,
            title:   action === 'APPROVED' ? 'KYC Approved ✅' : 'KYC Rejected ❌',
            message: action === 'APPROVED'
                ? 'Your identity verification has been approved. You now have full platform access.'
                : `Your KYC verification was rejected. Reason: ${notes || 'Please contact your Market Administrator.'}`,
            type: action === 'APPROVED' ? 'SUCCESS' : 'ERROR'
        });

        return res.status(200).json({ success: true, message: `KYC submission ${action.toLowerCase()} successfully` });
    } catch (error) {
        console.error('[DocumentController] KYC review error:', error);
        return res.status(500).json({ success: false, message: 'Failed to review KYC submission' });
    }
};

// ── 8. NEW: Download Shop Contract PDF ───────────────────────────────────────
exports.downloadShopContract = async (req, res) => {
    try {
        const { contractId } = req.params;
        const user = req.user;

        const contract = await prisma.rentContract.findUnique({
            where: { id: contractId },
            include: {
                facility: { include: { market: true } },
                vendor:   { include: { stakeholder: { include: { user: { include: { profile: true } } } } } }
            }
        });

        if (!contract) {
            return res.status(404).json({ success: false, message: 'Contract not found' });
        }

        const pdfBuffer = await pdfService.generateShopContract({
            facility:    contract.facility,
            vendor:      contract.vendor,
            contract,
            market:      contract.facility.market,
            issuerName:  user?.profile?.firstName + ' ' + (user?.profile?.lastName || '')
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ShopContract-${contractId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('[DocumentController] Contract PDF error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate contract PDF' });
    }
};

// ── 9. NEW: Download Invoice PDF ─────────────────────────────────────────────
exports.downloadInvoice = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { period } = req.query;

        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            include: {
                primaryMarket: true,
                stakeholder: { include: { user: { include: { profile: true } } } },
                rentContracts: {
                    where: { status: 'ACTIVE' },
                    include: { facility: true }
                }
            }
        });

        if (!vendor) {
            return res.status(404).json({ success: false, message: 'Vendor not found' });
        }

        const lineItems = vendor.rentContracts.map(c => ({
            description: `Monthly Rent — Unit ${c.facility?.unitNumber || 'N/A'}`,
            qty:         1,
            unitPrice:   Number(c.monthlyRent || c.facility?.monthlyRent || 0),
        }));

        const pdfBuffer = await pdfService.generateInvoice({
            vendor,
            market:        vendor.primaryMarket,
            lineItems,
            invoiceNumber: `INV-${vendorId.slice(0, 8).toUpperCase()}-${Date.now()}`,
            dueDate:       new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            issuedBy:      vendor.primaryMarket?.name || 'Market Authority'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Invoice-${vendorId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('[DocumentController] Invoice PDF error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
    }
};

// ── 10. NEW: Download Receipt PDF ────────────────────────────────────────────
exports.downloadReceipt = async (req, res) => {
    try {
        const { paymentId } = req.params;

        // Try to find in RentPayment or DailyCollection
        const payment = await prisma.rentPayment.findUnique({
            where: { id: paymentId },
            include: {
                vendor: { include: { primaryMarket: true } }
            }
        }).catch(() => null);

        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const pdfBuffer = await pdfService.generateReceipt({
            vendor:         payment.vendor,
            market:         payment.vendor?.primaryMarket,
            amount:         Number(payment.amountPaid || 0),
            paymentMethod:  payment.paymentMethod || 'N/A',
            refNumber:      `RCP-${payment.id.slice(0, 8).toUpperCase()}`,
            paidAt:         payment.paidAt || payment.createdAt,
            receivedBy:     'Market Authority'
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Receipt-${paymentId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('[DocumentController] Receipt PDF error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF' });
    }
};

// ── 11. NEW: Market Analytics Report PDF (Market Master / Super Admin only) ──
exports.downloadMarketReport = async (req, res) => {
    try {
        const { marketId } = req.params;
        const user = req.user;
        const { period } = req.query;

        // RBAC gate: only MARKET_MASTER / SUPER_ADMIN can call this
        const allowedRoles = ['MARKET_MASTER', 'SUPER_ADMIN', 'NATIONAL_ADMIN'];
        if (!user?.roles?.some(r => allowedRoles.includes(r))) {
            return res.status(403).json({ success: false, message: 'Access denied: insufficient role' });
        }

        const market = await prisma.market.findUnique({ where: { id: marketId } });
        if (!market) return res.status(404).json({ success: false, message: 'Market not found' });

        const [totalFacilities, occupiedCount, totalVendors, kycVerified, delinquent, revenue] =
            await Promise.all([
                prisma.facility.count({ where: { marketId } }),
                prisma.facility.count({ where: { marketId, occupationStatus: 'OCCUPIED' } }),
                prisma.vendor.count({ where: { primaryMarketId: marketId } }),
                prisma.stakeholder.count({ where: { vendor: { primaryMarketId: marketId }, kycStatus: 'VERIFIED' } }),
                prisma.vendor.count({ where: { primaryMarketId: marketId, isDelinquent: true } }),
                prisma.rentPayment.aggregate({
                    where: { vendor: { primaryMarketId: marketId } },
                    _sum: { amountPaid: true }
                })
            ]);

        const pdfBuffer = await pdfService.generateSystemReport({
            market,
            period: period || new Date().toLocaleString('en-GB', { month: 'long', year: 'numeric' }),
            generatedBy: (user?.profile?.firstName || '') + ' ' + (user?.profile?.lastName || ''),
            stats: {
                totalFacilities,
                occupiedFacilities: occupiedCount,
                totalVendors,
                kycVerified,
                delinquent,
                totalRevenue:   Number(revenue._sum.amountPaid || 0),
                outstandingDues: 0, // can be calculated separately
                pendingKyc:      totalVendors - kycVerified,
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="MarketReport-${marketId}.pdf"`);
        return res.send(pdfBuffer);
    } catch (error) {
        console.error('[DocumentController] Market report PDF error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate market report' });
    }
};

// ── 12. NEW: Analytics Stats endpoint (for Dashboard charts) ─────────────────
exports.getAnalyticsStats = async (req, res) => {
    try {
        const user    = req.user;
        const marketId = req.query.marketId || user?.marketId;

        // Build scope based on role
        const isSuperAdmin = user?.roles?.includes('SUPER_ADMIN');
        const facilityWhere  = isSuperAdmin ? {}  : { marketId };
        const vendorWhere    = isSuperAdmin ? {}  : { primaryMarketId: marketId };

        const [totalFacilities, occupiedCount, vacantCount, totalVendors,
               kycVerified, kycPending, delinquent, totalRevenue] = await Promise.all([
            prisma.facility.count({ where: facilityWhere }),
            prisma.facility.count({ where: { ...facilityWhere, occupationStatus: 'OCCUPIED' } }),
            prisma.facility.count({ where: { ...facilityWhere, occupationStatus: 'VACANT' } }),
            prisma.vendor.count({   where: vendorWhere }),
            prisma.stakeholder.count({ where: { kycStatus: 'VERIFIED', vendor: vendorWhere } }),
            prisma.stakeholder.count({ where: { kycStatus: 'PENDING',  vendor: vendorWhere } }),
            prisma.vendor.count({ where: { ...vendorWhere, isDelinquent: true } }),
            prisma.rentPayment.aggregate({
                where: { vendor: vendorWhere },
                _sum: { amountPaid: true }
            })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                occupancy: {
                    total:    totalFacilities,
                    occupied: occupiedCount,
                    vacant:   vacantCount,
                    rate:     totalFacilities > 0 ? +((occupiedCount / totalFacilities) * 100).toFixed(1) : 0
                },
                vendors: {
                    total:       totalVendors,
                    kycVerified,
                    kycPending,
                    delinquent,
                    compliant:   totalVendors - delinquent
                },
                revenue: {
                    totalCollected: Number(totalRevenue._sum.amountPaid || 0)
                }
            }
        });
    } catch (error) {
        console.error('[DocumentController] Analytics stats error:', error);
        return res.status(500).json({ success: false, message: 'Failed to get analytics stats' });
    }
};

// ── 13. NEW: Download Identity Forensic Report ────────────────────────────────
exports.downloadForensicReport = async (req, res) => {
    try {
        const { marketId } = req.params;
        const user = req.user;

        const auditData = await complianceService.generateIdentityAuditData({ marketId });
        const { buffer, signature } = await docProcessor.generateDocument('IDENTITY_AUDIT', {
            ...auditData,
            generatedBy: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ForensicReport-${marketId}-${signature.slice(0,8)}.pdf"`);
        return res.send(buffer);
    } catch (error) {
        console.error('[DocumentController] Forensic PDF error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate forensic report' });
    }
};

// ── 14. NEW: Verify Digital Signature ─────────────────────────────────────────
exports.verifyDigitalSignature = async (req, res) => {
    try {
        const { hash } = req.params;
        const { payload } = req.query; // decoded json payload for verification
        
        const isValid = docProcessor.verifySignature(JSON.parse(payload), hash);
        
        return res.status(200).json({
            success: true,
            verified: isValid,
            message: isValid ? 'Document signature is AUTHENTIC' : 'Signature mismatch - tampering detected'
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Invalid verification request' });
    }
};

// ── 15. NEW: Trigger Batch Invoice Generation ─────────────────────────────────
exports.triggerBatchInvoices = async (req, res) => {
    try {
        const { marketId } = req.body;
        const vendors = await prisma.vendor.findMany({
            where: { primaryMarketId: marketId },
            include: { primaryMarket: true, rentContracts: true }
        });

        const batchId = `INV-BATCH-${marketId}-${Date.now()}`;
        const tasks = vendors.map(v => ({
            type: 'INVOICE',
            id: v.id,
            data: {
                vendor: v,
                market: v.primaryMarket,
                lineItems: [{ description: 'Monthly Market Rent', qty: 1, unitPrice: 10000 }] // Simplified for batch
            }
        }));

        const result = await docProcessor.addToBatchQueue(batchId, tasks, req.user.id);
        
        return res.status(202).json({
            success: true,
            message: 'Batch invoice generation started',
            data: result
        });

    } catch (error) {
        console.error('[DocumentController] Batch trigger error:', error);
        return res.status(500).json({ success: false, message: 'Failed to trigger batch processing' });
    }
};
