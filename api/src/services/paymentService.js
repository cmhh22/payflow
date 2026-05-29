import { config } from '../config.js';
import { ApiError } from '../utils/errors.js';

const TIMEOUT_MS = 5000;

// Calls the Python payment service and returns its decision:
// { approved, status, amount, currency, reason }
export async function processPayment({ amount, currency }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${config.paymentService.url}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
      signal: controller.signal,
    });
  } catch (err) {
    // Network error, refused connection, or timeout (abort).
    throw new ApiError(
      503,
      'PAYMENT_SERVICE_UNAVAILABLE',
      'Payment service is unavailable'
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new ApiError(
      502,
      'PAYMENT_SERVICE_ERROR',
      'Payment service returned an error'
    );
  }

  return response.json();
}
