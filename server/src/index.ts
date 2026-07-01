// Copyright (c) 2026 Aviram Salamon. All Rights Reserved.
// Unauthorized use or distribution is prohibited.

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { loggerMiddleware } from './middleware/logger';
import routes from './routes';

dotenv.config();

console.log('Environment Variables:', {
  PORT: process.env.PORT,
  CLIENT_URL: process.env.CLIENT_URL,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}));
app.use(express.json());
app.use(loggerMiddleware);

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
