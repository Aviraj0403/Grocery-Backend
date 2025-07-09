import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import userAuthRoutes from './routers/userAuth.routes.js';
import categoryRoutes from './routers/category.routes.js';
import productRoutes from './routers/product.routes.js';
import adminRoutes from './routers/adminAuth.routes.js';
import cartRoutes from './routers/cart.routes.js';
import orderRoutes from './routers/order.routes.js';
import userRoutes from './routers/user.routes.js';
import offerRoutes from './routers/offer.routes.js';
import { logSessionActivity } from './middlewares/logSessionActivity.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';  // Import 'join' and 'dirname' from 'path'

// Get the current directory name in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost',
  'https://localhost',
  'https://grocery-ui-one.vercel.app', // Staging or demo
  'https://www.shanumart.in', // Production
  'capacitor://localhost',
];

// Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests without origin (mobile apps, curl, etc.)
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      // return callback(new Error('Not allowed by CORS'));
      return callback(null, true); // Allow all origins for now
    }
  },
  credentials: true, // Send cookies and authorization headers
}));

// Middleware for JSON body parsing and cookies
app.use(express.json());
app.use(cookieParser());

// Session activity logging middleware
app.use(logSessionActivity);

// API Routes
app.use('/api', userAuthRoutes);
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', adminRoutes);
app.use('/api', orderRoutes);
app.use('/api', cartRoutes);
app.use('/api', userRoutes);
app.use('/api', offerRoutes);

  // In development, serve assets (e.g., images, JavaScript) from 'public' folder
app.use(express.static(join(__dirname, 'public')));

app.get('/robots.txt', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'robots.txt'));
  });

// Root route (Health check or default response)
app.get('/', (req, res) => {
  res.send('Hello AviRaj!');
});

// Centralized error handling (for unhandled errors)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default app;
