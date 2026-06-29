// ================================================================
//  db/index.js  —  PostgreSQL connection pool (node-postgres)
// ================================================================
'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  host:               process.env.DB_HOST            || 'localhost',
  port:     parseInt(process.env.DB_PORT             || '5432', 10),
  database:           process.env.DB_NAME            || 'perumahan',
  user:               process.env.DB_USER            || 'postgres',
  password:           process.env.DB_PASSWORD        || '',
  max:      parseInt(process.env.DB_MAX_CONN         || '10',   10),
  idleTimeoutMillis:  parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONN_TIMEOUT_MS || '2000', 10),
});

// Log setiap koneksi baru (debug)
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] Koneksi baru ke PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Jalankan query dengan parameter.
 * @param {string} text  - SQL query (gunakan $1, $2, … sebagai placeholder)
 * @param {Array}  params
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Ambil satu client dari pool untuk transaksi manual.
 * Jangan lupa panggil client.release() setelah selesai.
 */
const getClient = () => pool.connect();

module.exports = { query, getClient, pool };
