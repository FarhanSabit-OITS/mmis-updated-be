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

const configureRouter = (app)=>{
    app.use('/api/auth', authRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/vendors', vendorRoutes); 
    app.use('/api/vendors', productRoutes); 
    app.use('/api/products', productRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api/superadmin/vendors', vendorRoutes);
    app.use('/api/market/staff', staffRoutes);
    app.use('/api/market/tokens', tokenRoutes);
    app.use('/api', paymentRoutes);
    app.use('/api/markets', marketRoutes)
    app.use('/api/facilities', facilityRoutes)
    app.use('/api/shops', facilityRoutes) // Add backward compatibility alias
    app.use('/api/admin/onboarding', adminOnboardingRoutes);
}

module.exports = configureRouter