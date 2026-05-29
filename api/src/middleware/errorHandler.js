import { ApiError } from '../utils/errors.js';

// 404 handler for unmatched routes.
export function notFound(req, res) {
  res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
}

// Centralized error handler. Must be registered last.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message, code: err.code });
  }

  // PostgreSQL unique violation (e.g. duplicated email).
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists', code: 'DUPLICATE' });
  }

  // PostgreSQL foreign key violation.
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Related resource does not exist', code: 'FK_VIOLATION' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
}
