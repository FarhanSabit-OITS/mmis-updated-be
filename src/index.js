require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const path = require('path');
const os = require('os');


const http = require('http');
const socketService = require('./services/socket.service');
const errorHandler = require('./middleware/errorHandler.middleware');
const configureRouter = require('./routes');
const { apiLimiter } = require('./middleware/rateLimit.middleware');

const app = express();
const server = http.createServer(app);

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent with requests
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

// Trust first proxy — required for accurate IP detection behind nginx/load balancers
// This ensures rate limiting is applied per real client IP, not the proxy IP
app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(apiLimiter);
app.use(cookieParser()); // Parse cookies for refresh token
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
// File upload middleware (for bulk CSV uploads)
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  useTempFiles: true,
  tempFileDir: os.tmpdir()
}));

configureRouter(app)




app.use(errorHandler)

const PORT = process.env.PORT || 5000;

// Initialize WebSockets before standard app listen
socketService.init(server);

server.listen(PORT, () => {
  console.log(`MarketMasterApi running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
