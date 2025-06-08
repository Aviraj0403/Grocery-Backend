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
import {logSessionActivity} from './middlewares/logSessionActivity.js';
import cors from 'cors';
const app = express();  

const allowedOrigins = [
  'http://localhost:5173',
  'https://grocery-ui-one.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


app.use(express.json());  
app.use(cookieParser());

app.use(logSessionActivity);
app.use('/api', userAuthRoutes);
app.use('/api', productRoutes);
app.use('/api',categoryRoutes);
app.use('/api', adminRoutes);
app.use('/api', orderRoutes);
app.use('/api', cartRoutes);
app.use("/api", userRoutes);
app.use('/api', offerRoutes);
app.get('/', (req, res) => {
  res.send('Hello AviRaj!');
});
// Add your routes here

export default app;
