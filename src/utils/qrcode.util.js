const QRCode = require('qrcode');

/**
 * Generate a QR code as a Data URL
 * @param {string} text 
 * @returns {Promise<string>}
 */
const generateQRCode = async (text) => {
    try {
        return await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 1,
            color: {
                dark: '#4f46e5', // indigo-600
                light: '#ffffff'
            }
        });
    } catch (err) {
        console.error('QR Code generation failed', err);
        throw err;
    }
};

module.exports = {
    generateQRCode
};
