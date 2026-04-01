require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const productRoutes = require('./routes/product.routes');
const vendorRoutes = require('./routes/vendor.routes');
const notificationRoutes = require('./routes/notification.routes');
const paymentRoutes = require('./routes/payment.routes');
const staffRoutes = require('./routes/staff.routes');
const tokenRoutes = require('./routes/token.routes');
const categoryRoutes = require('./routes/category.routes');
const aiRoutes = require('./routes/ai.routes');
const applicationRoutes = require('./routes/application.routes');

const app = express();

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Parse cookies for refresh token
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// File upload middleware (for bulk CSV uploads)
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/superadmin/vendors', vendorRoutes);
app.use('/api/market/staff', staffRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/market/tokens', tokenRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api', paymentRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MarketMasterApi running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
