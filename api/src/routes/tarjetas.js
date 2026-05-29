import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, ApiError } from '../utils/errors.js';
import { validateTarjeta, parseId } from '../utils/validation.js';

const router = Router({ mergeParams: true });

async function ensureUsuarioExists(usuarioId) {
  const result = await query('SELECT id FROM usuarios WHERE id = $1', [usuarioId]);
  if (result.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }
}

// POST /usuarios/:usuarioId/tarjetas  -> register a card for a user
router.post('/', asyncHandler(async (req, res) => {
  const usuarioId = parseId(req.params.usuarioId, 'usuarioId');
  await ensureUsuarioExists(usuarioId);

  const card = validateTarjeta(req.body);
  const result = await query(
    `INSERT INTO tarjetas (usuario_id, titular, last_four, brand, exp_month, exp_year)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [usuarioId, card.titular, card.last_four, card.brand, card.exp_month, card.exp_year]
  );
  res.status(201).json(result.rows[0]);
}));

// GET /usuarios/:usuarioId/tarjetas  -> list a user's cards
router.get('/', asyncHandler(async (req, res) => {
  const usuarioId = parseId(req.params.usuarioId, 'usuarioId');
  await ensureUsuarioExists(usuarioId);

  const result = await query(
    'SELECT * FROM tarjetas WHERE usuario_id = $1 ORDER BY id',
    [usuarioId]
  );
  res.json(result.rows);
}));

export default router;
