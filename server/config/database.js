import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'nge_2026',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to execute transactions
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Database initialization function
export const initializeDatabase = async () => {
  try {
    // Test basic connection
    await query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Check if required tables exist
    const tablesCheck = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('colleges', 'games', 'teams', 'team_members', 'sponsor_registrations', 'visitor_registrations')
    `);
    
    if (tablesCheck.rows.length < 6) {
      console.warn('Some required tables are missing. Please run the database schema.');
    } else {
      console.log('All required tables are present');
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
};

// Graceful shutdown
export const closeDatabase = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

export default pool;
