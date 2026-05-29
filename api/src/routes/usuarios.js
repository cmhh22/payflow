import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, ApiError } from '../utils/errors.js';
import { validateUsuario, parseId } from '../utils/validation.js';
import tarjetasRouter from './tarjetas.js';

const router = Router();

// POST /usuarios  -> create a user
router.post('/', asyncHandler(async (req, res) => {
  const { nombre, email } = validateUsuario(req.body);
  const result = await query(
    'INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *',
    [nombre, email]
  );
  res.status(201).json(result.rows[0]);
}));

// GET /usuarios  -> list all users
router.get('/', asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM usuarios ORDER BY id');
  res.json(result.rows);
}));

// GET /usuarios/:id  -> get a single user
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);
  const result = await query('SELECT * FROM usuarios WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }
  res.json(result.rows[0]);
}));

// GET /usuarios/:id/pagos -> payment history for a user
router.get('/:id/pagos', asyncHandler(async (req, res) => {
  const id = parseId(req.params.id);

  const userResult = await query('SELECT id FROM usuarios WHERE id = $1', [id]);
  if (userResult.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  const result = await query(
    'SELECT * FROM pagos WHERE usuario_id = $1 ORDER BY created_at DESC, id DESC',
    [id]
  );
  res.json(result.rows);
}));

// Nested cards routes: /usuarios/:usuarioId/tarjetas
router.use('/:usuarioId/tarjetas', tarjetasRouter);

export default router;
