import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { config } from '../src/config.js';

const { Client } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.resolve(__dirname, '../../db');

async function run() {
  const client = new Client(config.db);
  await client.connect();
  try {
    const schema = await readFile(path.join(dbDir, 'schema.sql'), 'utf8');
    await client.query(schema);
    console.log('Schema applied successfully.');

    const seed = await readFile(path.join(dbDir, 'seed.sql'), 'utf8');
    await client.query(seed);
    console.log('Seed data inserted successfully.');

    console.log('Database initialized.');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});
