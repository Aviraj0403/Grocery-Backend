import express from 'express'; 
import bodyParser from 'body-parser'; 
import cookieParser from 'cookie-parser';
import authRoutes from './routers/auth.routes.js';

const app = express();  

app.use(express.json());  
app.use(cookieParser());

app.use('/api/auth', authRoutes); 
app.get('/', (req, res) => {
  res.send('Hello World!');
});
// Add your routes here

export default app;
