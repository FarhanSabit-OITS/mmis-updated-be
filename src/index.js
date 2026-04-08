require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');


const errorHandler = require('./middleware/errorHandler.middleware');
const configureRouter = require('./routes');

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

configureRouter(app)




app.use(errorHandler)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MarketMasterApi running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
