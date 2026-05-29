import { ApiError } from './errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseId(value, name = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', `Invalid ${name}`);
  }
  return id;
}

export function validateUsuario(body) {
  const { nombre, email } = body ?? {};
  if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Field "nombre" is required');
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'A valid "email" is required');
  }
  return { nombre: nombre.trim(), email: email.trim().toLowerCase() };
}

export function validateTarjeta(body) {
  const { titular, numero, exp_month, exp_year, brand } = body ?? {};

  if (!titular || typeof titular !== 'string' || titular.trim().length === 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Field "titular" is required');
  }
  if (!numero || !/^\d{13,19}$/.test(String(numero))) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      'Field "numero" must contain 13 to 19 digits (fictitious data only)'
    );
  }

  const month = Number(exp_month);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Field "exp_month" must be between 1 and 12');
  }

  const year = Number(exp_year);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Field "exp_year" must be between 2000 and 2100');
  }

  // Keep only the last four digits — never store the full number.
  const last_four = String(numero).slice(-4);

  return {
    titular: titular.trim(),
    last_four,
    brand: brand ? String(brand).trim() : null,
    exp_month: month,
    exp_year: year,
  };
}

export function validatePago(body) {
  const { usuario_id, tarjeta_id, monto, moneda } = body ?? {};

  const usuarioId = parseId(usuario_id, 'usuario_id');
  const tarjetaId = parseId(tarjeta_id, 'tarjeta_id');

  const amount = Number(monto);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Field "monto" must be a number greater than 0');
  }

  let currency = 'USD';
  if (moneda !== undefined) {
    if (typeof moneda !== 'string' || moneda.trim().length !== 3) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Field "moneda" must be a 3-letter code');
    }
    currency = moneda.trim().toUpperCase();
  }

  return { usuarioId, tarjetaId, amount, currency };
}
