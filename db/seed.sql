-- PayFlow seed data (sample fictitious data for testing)

INSERT INTO usuarios (nombre, email) VALUES
    ('Ada Lovelace', 'ada@example.com'),
    ('Alan Turing',  'alan@example.com');

INSERT INTO tarjetas (usuario_id, titular, last_four, brand, exp_month, exp_year) VALUES
    (1, 'Ada Lovelace', '4242', 'Visa',       12, 2030),
    (1, 'Ada Lovelace', '5555', 'Mastercard', 6,  2029),
    (2, 'Alan Turing',  '1881', 'Visa',       9,  2028);

INSERT INTO pagos (usuario_id, tarjeta_id, monto, moneda, status) VALUES
    (1, 1, 49.99,  'USD', 'approved'),
    (1, 2, 120.00, 'USD', 'rejected'),
    (2, 3, 15.50,  'USD', 'approved');
