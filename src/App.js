import express from 'express'; 
import bodyParser from 'body-parser'; 
import cookieParser from 'cookie-parser';
import userAuthRoutes from './routers/userAuth.routes.js';
import categoryRoutes from './routers/category.routes.js';
import productRoutes from './routers/product.routes.js';
import {logSessionActivity} from './middlewares/logSessionActivity.js';
import cors from 'cors';
const app = express();  

app.use(cors({
  origin: 'http://localhost:5173',  
  credentials: true, 
}));

app.use(express.json());  
app.use(cookieParser());

app.use(logSessionActivity);
app.use('/api', userAuthRoutes);
app.use('/api', productRoutes);
app.use('/api',categoryRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
// Add your routes here

export default app;
