-- PayFlow database schema
-- PostgreSQL

-- Drop tables if they already exist (safe re-runs during development)
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS tarjetas CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Users
CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(120) NOT NULL,
    email       VARCHAR(180) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Credit cards (masked / fictitious data only)
CREATE TABLE tarjetas (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titular         VARCHAR(120) NOT NULL,
    last_four       CHAR(4) NOT NULL,
    brand           VARCHAR(40),
    exp_month       SMALLINT NOT NULL CHECK (exp_month BETWEEN 1 AND 12),
    exp_year        SMALLINT NOT NULL CHECK (exp_year BETWEEN 2000 AND 2100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE pagos (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tarjeta_id  INTEGER NOT NULL REFERENCES tarjetas(id) ON DELETE CASCADE,
    monto       NUMERIC(12,2) NOT NULL CHECK (monto > 0),
    moneda      VARCHAR(3) NOT NULL DEFAULT 'USD',
    status      VARCHAR(10) NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index to speed up "payment history for a user"
CREATE INDEX idx_pagos_usuario_id ON pagos(usuario_id);
CREATE INDEX idx_tarjetas_usuario_id ON tarjetas(usuario_id);
