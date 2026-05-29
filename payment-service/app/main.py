"""PayFlow payment processing service.

A minimal FastAPI microservice that simulates a payment processor. It receives a
payment amount and randomly approves (80%) or rejects (20%) the transaction.
"""

import random

from fastapi import FastAPI
from pydantic import BaseModel, Field

# Probability that a payment is approved.
APPROVAL_RATE = 0.8

app = FastAPI(
    title="PayFlow Payment Service",
    description="Simulated payment processor (random approval).",
    version="1.0.0",
)


class PaymentRequest(BaseModel):
    """Incoming payment to be processed."""

    amount: float = Field(..., gt=0, description="Payment amount, must be greater than 0.")
    currency: str = Field(default="USD", min_length=3, max_length=3)


class PaymentResponse(BaseModel):
    """Result of processing a payment."""

    approved: bool
    status: str  # "approved" or "rejected"
    amount: float
    currency: str
    reason: str | None = None


@app.get("/health")
def health() -> dict:
    """Liveness check."""
    return {"status": "ok", "service": "payflow-payment-service"}


@app.post("/process", response_model=PaymentResponse)
def process_payment(payment: PaymentRequest) -> PaymentResponse:
    """Randomly approve or reject the payment based on APPROVAL_RATE."""
    approved = random.random() < APPROVAL_RATE
    return PaymentResponse(
        approved=approved,
        status="approved" if approved else "rejected",
        amount=payment.amount,
        currency=payment.currency,
        reason=None if approved else "Payment declined by processor",
    )
