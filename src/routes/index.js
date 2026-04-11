const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const productRoutes = require('./product.routes');
const vendorRoutes = require('./vendor.routes');
const notificationRoutes = require('./notification.routes');
const paymentRoutes = require('./payment.routes');
const staffRoutes = require('./staff.routes');
const tokenRoutes = require('./token.routes');
const marketRoutes = require('./market.route')
const facilityRoutes = require("./facility.routes")
const adminOnboardingRoutes = require('./admin.onboarding.routes');
const requisitionRoutes = require('./requisition.route');
const bulkRoutes = require('./bulk.routes');
const assetRoutes = require('./asset.routes');
const supportRoutes = require('./support.routes');
const orderRoutes = require('./order.route');
const complianceRoutes = require('./compliance.routes');
const documentRoutes = require('./document.routes');
const deliveryRoutes = require('./delivery.route');
const inventoryRoutes = require('./inventory.routes');

const configureRouter = (app)=>{
    app.use('/api/auth', authRoutes);
    app.use('/api/compliance', complianceRoutes);
    app.use('/api/bulk', bulkRoutes);
    app.use('/api/documents', documentRoutes);
    app.use('/api/assets', assetRoutes);
    app.use('/api/support', supportRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/vendors', vendorRoutes); 
    app.use('/api/vendors', productRoutes); 
    app.use('/api/products', productRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/superadmin/vendors', vendorRoutes);
    app.use('/api/market/staff', staffRoutes);
    app.use('/api/market/tokens', tokenRoutes);
    app.use('/api/gate', tokenRoutes); // Alias for Frontend Gate Service
    app.use('/api/requisitions', requisitionRoutes);
    app.use('/api/financials', paymentRoutes); // Alias for Frontend Financials Service
    app.use('/api/applications', vendorRoutes); // Alias for Frontend Applications Service
    app.use('/api', paymentRoutes);
    app.use('/api/markets', marketRoutes)
    app.use('/api/facilities', facilityRoutes)
    app.use('/api/shops', facilityRoutes) // Add backward compatibility alias
    app.use('/api/admin/onboarding', adminOnboardingRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/deliveries', deliveryRoutes);
    app.use('/api/inventory', inventoryRoutes);
}

module.exports = configureRouter