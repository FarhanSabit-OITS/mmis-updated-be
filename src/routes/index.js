const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const productRoutes = require('./product.routes');
const vendorRoutes = require('./vendor.routes');
const notificationRoutes = require('./notification.routes');
const paymentRoutes = require('./payment.routes');
const staffRoutes = require('./staff.routes');
const tokenRoutes = require('./token.routes');
const marketRoutes = require('./market.route')
const shopRoutes = require("./shop.routes")
const stallRoutes = require("./stall.routes")
const gateRoutes = require("./gate.routes")
const qrcodeRoutes = require("./qrcode.routes")
const gateOperationRoutes = require("./gateOperation.routes")
const deliveryRoutes = require("./delivery.routes")
const supplierRoutes = require("./supplier.routes")
const rentContractRoutes = require("./rentContract.routes")
const documentRoutes = require("./document.routes")
const kycRoutes = require("./kyc.routes")
const cityRoutes = require('./cities.routes')
const gateTerminalRoutes = require("./gateTerminal.routes")
const financialsRoutes = require("./financials.routes")


const configureRouter = (app)=>{
    app.use('/api/auth', authRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/vendors', vendorRoutes); 
    app.use('/api/vendors', productRoutes); 
    app.use('/api/products', productRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/superadmin/vendors', vendorRoutes);
    app.use('/api/superadmin/suppliers', supplierRoutes);
    app.use('/api/market/staff', staffRoutes);
    app.use('/api/market/tokens', tokenRoutes);
    app.use('/api', paymentRoutes);
    app.use('/api/markets', marketRoutes)
    app.use('/api/shops', shopRoutes)
    app.use('/api/stalls', stallRoutes)
    app.use('/api/marketGates', gateRoutes)
    app.use('/api/qrcodes', qrcodeRoutes)
    app.use('/api/gateOperations', gateOperationRoutes)
    app.use('/api/deliveries', deliveryRoutes)
    app.use('/api/rentContracts', rentContractRoutes)
    app.use('/api/documents', documentRoutes)
    app.use('/api/kyc', kycRoutes)
    app.use('/api/cities', cityRoutes)
    app.use('/api/gate', gateTerminalRoutes)
    app.use('/api/financials', financialsRoutes)
}

module.exports = configureRouter