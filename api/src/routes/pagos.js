import { Router } from 'express';
import { query } from '../db.js';
import { asyncHandler, ApiError } from '../utils/errors.js';
import { validatePago } from '../utils/validation.js';
import { processPayment } from '../services/paymentService.js';

const router = Router();

// POST /pagos -> create a payment (calls the Python payment service)
router.post('/', asyncHandler(async (req, res) => {
  const { usuarioId, tarjetaId, amount, currency } = validatePago(req.body);

  // 1. Verify the user exists.
  const userResult = await query('SELECT id FROM usuarios WHERE id = $1', [usuarioId]);
  if (userResult.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'User not found');
  }

  // 2. Verify the card exists AND belongs to the user.
  const cardResult = await query(
    'SELECT id FROM tarjetas WHERE id = $1 AND usuario_id = $2',
    [tarjetaId, usuarioId]
  );
  if (cardResult.rows.length === 0) {
    throw new ApiError(404, 'NOT_FOUND', 'Card not found for this user');
  }

  // 3. Ask the Python service to process the payment.
  const decision = await processPayment({ amount, currency });

  // 4. Persist the payment with the resulting status.
  const result = await query(
    `INSERT INTO pagos (usuario_id, tarjeta_id, monto, moneda, status)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [usuarioId, tarjetaId, amount, currency, decision.status]
  );

  // 5. Return the created payment, enriched with the processor decision.
  res.status(201).json({
    ...result.rows[0],
    approved: decision.approved,
    reason: decision.reason ?? null,
  });
}));

export default router;
