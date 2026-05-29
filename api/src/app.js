import express from 'express';
import usuariosRouter from './routes/usuarios.js';
import pagosRouter from './routes/pagos.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payflow-api' });
});

// Resource routes
app.use('/usuarios', usuariosRouter);
app.use('/pagos', pagosRouter);

// 404 + centralized error handling (must be registered last)
app.use(notFound);
app.use(errorHandler);

export default app;
