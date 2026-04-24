const crypto = require('crypto');

/**
 * Standardized Unique Identification Utility
 * Generates human-readable, trackable codes for various MMIS entities.
 */

const EntityPrefixes = {
    USER: 'USR',
    VENDOR: 'VND',
    SUPPLIER: 'SUP',
    PURCHASE_ORDER: 'PO',
    DELIVERY: 'DLV',
    GATE_TOKEN: 'GTK',
    PARKING_TOKEN: 'PRK',
    STOCK_MOVEMENT: 'STK',
    TRANSACTION: 'TXN',
    INVOICE: 'INV',
    RECEIPT: 'RCP',
    CONTRACT: 'CTR',
    SHOP: 'SHP',
    STALL: 'STL',
    COMPLAINT: 'CMP'
};

/**
 * Generates a unique code for an entity
 * Format: [PREFIX]-[YYYYMMDD]-[RANDOM]
 * 
 * @param {string} entityType - The type of entity (from EntityPrefixes keys)
 * @returns {string} - The generated unique code
 */
const generateUniqueCode = (entityType) => {
    const prefix = EntityPrefixes[entityType] || 'GEN';
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    return `${prefix}-${datePart}-${randomPart}`;
};

/**
 * Generates a payload for a QR code based on entity data
 * 
 * @param {string} entityType - The type of entity
 * @param {Object} data - Entity data (id, uniqueCode, etc.)
 * @returns {string} - JSON string to be encoded in QR
 */
const generateQrPayload = (entityType, data) => {
    const payload = {
        type: entityType,
        code: data.uniqueCode || data.deliveryCode || data.tokenCode || data.id,
        ts: Date.now(),
        v: '1.0'
    };
    
    // Add additional metadata if needed
    if (data.marketId) payload.mid = data.marketId;
    if (data.amount) payload.amt = data.amount;
    
    return JSON.stringify(payload);
};

module.exports = {
    generateUniqueCode,
    generateQrPayload,
    EntityPrefixes
};
