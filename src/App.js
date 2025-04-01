import express from 'express'; 
import bodyParser from 'body-parser'; 
import cookieParser from 'cookie-parser';

const app = express();  

app.use(express.json());  

// app.use('/api', yourRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
// Add your routes here

export default app;
