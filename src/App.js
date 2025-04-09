import express from 'express'; 
import bodyParser from 'body-parser'; 
import cookieParser from 'cookie-parser';
import userAuthRoutes from './routers/userAuth.routes.js';
import categoryRoutes from './routers/category.routes.js';
import productRoutes from './routers/product.routes.js';

const app = express();  

app.use(express.json());  
app.use(cookieParser());

app.use('/api', userAuthRoutes);
app.use('/api', productRoutes);
app.use('/api',categoryRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
// Add your routes here

export default app;
