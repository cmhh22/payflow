# PayFlow — Step 4: Python payment processing service (FastAPI)

You are working in the existing `payflow` monorepo. Git is connected to
`origin/main`. The `db/` and `api/` folders are done. Now build the Python
microservice that simulates payment processing.

## What this service does

A small FastAPI app with one job: receive a payment amount and reply whether the
payment is **approved** or **rejected**, at random (80% approved, 20% rejected).
The Node.js API will call this service in a later step.

## Tech decisions (respect these)

- **FastAPI** + **uvicorn** (ASGI server).
- **Pydantic v2** models for request/response validation (comes with FastAPI).
- Dependencies installed into a local virtual environment `payment-service/venv/`
  (git-ignored).
- Endpoints:
  - `GET /health` → liveness check.
  - `POST /process` → process a payment, return approval decision.
- Approval probability is a named constant (`APPROVAL_RATE = 0.8`).

## Target structure for `payment-service/`

```
payment-service/
├── requirements.txt
└── app/
    ├── __init__.py
    └── main.py
```

## Tasks

### 1. Create `payment-service/requirements.txt`

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
```

### 2. Create `payment-service/app/__init__.py`

Leave it empty (it just marks `app` as a Python package).

### 3. Create `payment-service/app/main.py`

```python
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
```

### 4. Create the virtual environment and install dependencies

From inside the `payment-service/` folder, run these (Windows PowerShell). Use the
venv's interpreter directly instead of activating, to avoid activation-policy issues:

```bash
python -m venv venv
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 5. Smoke-check that the app imports correctly

```bash
venv\Scripts\python.exe -c "from app.main import app; print('import OK')"
```

It should print `import OK`. Do NOT start the uvicorn server now.

### 6. Update root `.gitignore`

Append this block at the END of the root `.gitignore` file (keep existing
contents intact):

```
# Internal workflow instructions (not part of the deliverable)
instructions/
```

### 7. Remove the placeholder and commit

```bash
git rm payment-service/.gitkeep
git add payment-service/ .gitignore
git commit -m "feat(payment-service): add FastAPI payment processing service"
git push
```

Note: `payment-service/venv/` must NOT be committed (it is git-ignored). Confirm it
is excluded.

## After finishing, report back

1. Show the final tree of `payment-service/` (excluding `venv`).
2. Confirm the smoke check printed `import OK`.
3. Confirm `venv/` is NOT tracked by git.
4. Confirm the commit and push succeeded.
