import cluster from 'cluster';
import os from 'os';
import dotenv from 'dotenv';
import connectDB from './src/config/dbConfig.js';
import app from './src/App.js';

dotenv.config();

const numCPUs = os.cpus().length;
const port = process.env.PORT || 4000;

export const startCluster = () => {
  console.log(`\n📦 Master PID: ${process.pid}`);
  console.log(`🧠 Forking ${numCPUs} workers...\n`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(`❌ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
};

if (cluster.isWorker) {
  connectDB()
    .then(() => {
      console.log(`✅ Worker ${process.pid} connected to MongoDB`);
      app.listen(port, () => {
        console.log(`🚀 Worker ${process.pid} running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error(`🔴 Worker ${process.pid} failed to connect to MongoDB:`, err);
    });
}
