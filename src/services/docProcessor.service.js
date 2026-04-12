/**
 * Document Processor Engine - High Security Orchestrator
 * Handles cryptographic signatures, batch queuing, and storage routing.
 */

const crypto = require('crypto');
const fs = require('fs-extra');
const path = require('path');
const pdfService = require('./pdf.service');
const notificationService = require('./notification.service');

const SECRET_KEY = process.env.DOC_SIGNING_SECRET || 'MMIS-FORENSIC-PROTOCOL-2026';

const STORAGE_ROOT = path.join(process.cwd(), 'storage/documents');

class DocumentProcessor {
    constructor() {
        this.queue = [];
        this.processing = false;
        // Ensure storage directory exists
        fs.ensureDirSync(STORAGE_ROOT);
        fs.ensureDirSync(path.join(STORAGE_ROOT, 'batches'));
    }

    /**
     * Generate HMAC-SHA256 signature for document authenticity
     */
    generateSignature(payload) {
        return crypto
            .createHmac('sha256', SECRET_KEY)
            .update(JSON.stringify(payload))
            .digest('hex');
    }

    /**
     * Verify document hash integrity
     */
    verifySignature(payload, signature) {
        const expected = this.generateSignature(payload);
        return expected === signature;
    }

    /**
     * Core Generation: Single Document
     */
    async generateDocument(type, data) {
        const signature = this.generateSignature({
            type,
            id: data.id || Date.now(),
            ts: new Date().toISOString()
        });

        let buffer;
        switch (type) {
            case 'INVOICE':
                buffer = await pdfService.generateInvoice({ ...data, signature });
                break;
            case 'RECEIPT':
                buffer = await pdfService.generateReceipt({ ...data, signature });
                break;
            case 'IDENTITY_AUDIT':
                buffer = await pdfService.generateSystemReport({ ...data, type: 'IDENTITY_FORENSIC', signature });
                break;
            default:
                throw new Error(`Unknown document type: ${type}`);
        }

        return { buffer, signature };
    }

    /**
     * Batch Processor: Asynchronous Queue
     */
    async addToBatchQueue(batchId, taskList, userId = null) {
        const batchDir = path.join(STORAGE_ROOT, 'batches', batchId);
        await fs.ensureDir(batchDir);

        this.queue.push({ batchId, taskList, batchDir, userId, status: 'PENDING' });
        if (!this.processing) this.processQueue();
        
        return { batchId, position: this.queue.length };
    }


    async processQueue() {
        if (this.queue.length === 0) {
            this.processing = false;
            return;
        }

        this.processing = true;
        const currentBatch = this.queue.shift();
        currentBatch.status = 'PROCESSING';

        console.log(`[DocProcessor] Starting Batch ${currentBatch.batchId} (${currentBatch.taskList.length} items)`);

        // Notify user about batch start
        if (currentBatch.userId) {
            await notificationService.notify({
                userId: currentBatch.userId,
                title: 'Document Processing Started',
                message: `Processing your batch of ${currentBatch.taskList.length} documents...`,
                type: 'BATCH',
                priority: 'INFO',
                metadata: { batchId: currentBatch.batchId, status: 'STARTING' }
            });
        }

        try {
            let completedCount = 0;
            for (const task of currentBatch.taskList) {
                const { buffer, signature } = await this.generateDocument(task.type, task.data);
                const filename = `${task.type}-${task.id}-${signature.slice(0, 8)}.pdf`;
                await fs.writeFile(path.join(currentBatch.batchDir, filename), buffer);
                completedCount++;
            }

            console.log(`[DocProcessor] Completed Batch ${currentBatch.batchId}`);

            // Notify user about batch completion
            if (currentBatch.userId) {
                await notificationService.notify({
                    userId: currentBatch.userId,
                    title: 'Batch Generation Complete',
                    message: `Successfully generated ${completedCount} documents.`,
                    type: 'BATCH',
                    priority: 'SUCCESS',
                    metadata: { 
                        batchId: currentBatch.batchId, 
                        status: 'COMPLETED',
                        count: completedCount,
                        path: currentBatch.batchDir
                    }
                });
            }
        } catch (error) {
            console.error(`[DocProcessor] Batch ${currentBatch.batchId} failed:`, error);
            
            if (currentBatch.userId) {
                await notificationService.notify({
                    userId: currentBatch.userId,
                    title: 'Document Processing Failed',
                    message: `An error occurred while generating your documents.`,
                    type: 'BATCH',
                    priority: 'HIGH',
                    metadata: { batchId: currentBatch.batchId, status: 'FAILED', error: error.message }
                });
            }
        }

        this.processQueue();
    }

}

module.exports = new DocumentProcessor();
