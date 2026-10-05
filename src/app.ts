import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './UserRoutes';

export const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (_req, res) => { res.send('Hello, World! Open /test.html to test the users API.'); });
app.use('/api', userRoutes);
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = error.status === 400 ? 400 : error.status === 413 ? 413 : 500;
  res.status(status).json({ message: status === 400 ? 'Invalid JSON body' : status === 413 ? 'Request too large' : 'Internal server error' });
};
app.use(errorHandler);
