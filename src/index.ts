import 'dotenv/config';
import mongoose from 'mongoose';
import { app } from './app';

async function start() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Set MONGODB_URI in .env before starting the server');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('Connected to MongoDB');
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 3000}`);
  });
  server.on('error', () => { console.error('Cannot start HTTP server. Check whether the port is in use.'); void mongoose.disconnect().finally(() => process.exit(1)); });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => { server.close(() => { void mongoose.disconnect().then(() => process.exit(0)); }); });
  }
}
start().catch(() => {
  console.error('Cannot connect to MongoDB. Check MONGODB_URI, database credentials and Atlas IP Access List.');
  process.exit(1);
});
