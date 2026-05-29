import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load the .env located at the project root (two levels up from src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  api: {
    port: Number(process.env.API_PORT) || 3000,
  },
  db: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'payflow',
    password: process.env.POSTGRES_PASSWORD || 'payflow_pass',
    database: process.env.POSTGRES_DB || 'payflow',
  },
  paymentService: {
    url: process.env.PAYMENT_SERVICE_URL || 'http://localhost:8000',
  },
};
